import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { classifyTransaction } from '@/lib/classifier/tier1Classifier'
import { resolveMoneyAccount } from '@/lib/classifier/regexRules'
import { classifyWithTier2 } from '@/lib/classifier/tier2Classifier'

interface TransactionRow {
  id: string
  umkm_id: string
  source: string
  amount: number
  transaction_type: 'in' | 'out'
  raw_description: string
  transaction_date: string
}

const PAGE_SIZE = 1000

// Subset akun SAK EMKM yang relevan untuk transaksi harian UMKM (bukan seluruh 21
// akun — akun periode-akhir seperti Akumulasi Penyusutan/Beban Penyusutan (131/711)
// dan akun berbasis kredit-usaha (110/200, tidak relevan untuk UMKM cash/QRIS) dikecualikan.
const TIER2_CANDIDATE_ACCOUNT_CODES = [
  '120', '130', '210', '220', '301', '302', '400', '401',
  '630', '631', '632', '633', '634', '635', '636', '637',
]

// Ditentukan dari uji coba nyata (lihat laporan) — di atas threshold ini hasil Tier 2
// konsisten masuk akal, di bawahnya konsisten meleset/ambigu.
const TIER2_CONFIDENCE_THRESHOLD = 0.5

function toPeriodMonth(transactionDate: string): string {
  const date = new Date(transactionDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export async function POST() {
  // PostgREST caps unpaginated responses at 1000 rows by default — page through
  // with .range() so a large pending backlog isn't silently truncated (GOTCHA #4).
  const transactions: TransactionRow[] = []
  let fetchFrom = 0
  while (true) {
    const { data, error: fetchError } = await supabaseAdmin
      .from('transactions')
      .select('id, umkm_id, source, amount, transaction_type, raw_description, transaction_date')
      .eq('classification_status', 'pending')
      .range(fetchFrom, fetchFrom + PAGE_SIZE - 1)

    if (fetchError) {
      return NextResponse.json({ status: 'error', message: fetchError.message }, { status: 500 })
    }

    const page = (data ?? []) as TransactionRow[]
    transactions.push(...page)

    if (page.length < PAGE_SIZE) break
    fetchFrom += PAGE_SIZE
  }

  let tier1ClassifiedCount = 0
  const tier1Unmatched: TransactionRow[] = []

  for (const trx of transactions) {
    const result = classifyTransaction(trx.raw_description, trx.transaction_type, trx.source)

    if (!result.matched || !result.entries) {
      tier1Unmatched.push(trx)
      continue
    }

    const periodMonth = toPeriodMonth(trx.transaction_date)
    const ledgerRows = result.entries.map((entry) => ({
      transaction_id: trx.id,
      umkm_id: trx.umkm_id,
      account_code: entry.account_code,
      entry_side: entry.entry_side,
      journal_type: entry.journal_type,
      amount: trx.amount,
      period_month: periodMonth,
      confidence_score: 1.0,
    }))

    const { error: insertError } = await supabaseAdmin.from('ledger_entries').insert(ledgerRows)
    if (insertError) {
      return NextResponse.json(
        { status: 'error', message: insertError.message, transaction_id: trx.id },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabaseAdmin
      .from('transactions')
      .update({ classification_status: 'classified', classification_tier: 'regex' })
      .eq('id', trx.id)
    if (updateError) {
      return NextResponse.json(
        { status: 'error', message: updateError.message, transaction_id: trx.id },
        { status: 500 }
      )
    }

    tier1ClassifiedCount++
  }

  // --- Tier 2: fallback IndoBERT (Hugging Face zero-shot) untuk sisa yang tidak
  //     ke-match regex Tier 1. ---
  let tier2ClassifiedCount = 0
  let needsTier3Count = 0

  if (tier1Unmatched.length > 0) {
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from('chart_of_accounts')
      .select('account_code, account_name, normal_balance')
      .in('account_code', TIER2_CANDIDATE_ACCOUNT_CODES)

    if (accountsError) {
      return NextResponse.json({ status: 'error', message: accountsError.message }, { status: 500 })
    }

    const accountByLabel = new Map(
      (accounts ?? []).map((a) => [a.account_name, { account_code: a.account_code as string }])
    )
    const candidateLabels = (accounts ?? []).map((a) => a.account_name as string)

    for (const trx of tier1Unmatched) {
      const tier2Result = await classifyWithTier2(trx.raw_description, candidateLabels)
      const matchedAccount = tier2Result ? accountByLabel.get(tier2Result.label) : undefined

      if (!tier2Result || !matchedAccount || tier2Result.score < TIER2_CONFIDENCE_THRESHOLD) {
        const { error: updateError } = await supabaseAdmin
          .from('transactions')
          .update({ classification_status: 'needs_tier3' })
          .eq('id', trx.id)
        if (updateError) {
          return NextResponse.json(
            { status: 'error', message: updateError.message, transaction_id: trx.id },
            { status: 500 }
          )
        }
        needsTier3Count++
        continue
      }

      const periodMonth = toPeriodMonth(trx.transaction_date)
      const moneyAccount = resolveMoneyAccount(trx.source)
      const journalType = trx.transaction_type === 'in' ? 'kas_masuk' : 'kas_keluar'

      const ledgerRows =
        trx.transaction_type === 'in'
          ? [
              { account_code: moneyAccount, entry_side: 'debit' as const },
              { account_code: matchedAccount.account_code, entry_side: 'credit' as const },
            ]
          : [
              { account_code: matchedAccount.account_code, entry_side: 'debit' as const },
              { account_code: moneyAccount, entry_side: 'credit' as const },
            ]

      const { error: insertError } = await supabaseAdmin.from('ledger_entries').insert(
        ledgerRows.map((entry) => ({
          transaction_id: trx.id,
          umkm_id: trx.umkm_id,
          account_code: entry.account_code,
          entry_side: entry.entry_side,
          journal_type: journalType,
          amount: trx.amount,
          period_month: periodMonth,
          confidence_score: tier2Result.score,
        }))
      )
      if (insertError) {
        return NextResponse.json(
          { status: 'error', message: insertError.message, transaction_id: trx.id },
          { status: 500 }
        )
      }

      const { error: updateError } = await supabaseAdmin
        .from('transactions')
        .update({ classification_status: 'classified', classification_tier: 'indobert' })
        .eq('id', trx.id)
      if (updateError) {
        return NextResponse.json(
          { status: 'error', message: updateError.message, transaction_id: trx.id },
          { status: 500 }
        )
      }

      tier2ClassifiedCount++
    }
  }

  const debitRows: { amount: number }[] = []
  let debitFrom = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('ledger_entries')
      .select('amount')
      .eq('entry_side', 'debit')
      .range(debitFrom, debitFrom + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    const page = data ?? []
    debitRows.push(...page)
    if (page.length < PAGE_SIZE) break
    debitFrom += PAGE_SIZE
  }

  const creditRows: { amount: number }[] = []
  let creditFrom = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('ledger_entries')
      .select('amount')
      .eq('entry_side', 'credit')
      .range(creditFrom, creditFrom + PAGE_SIZE - 1)

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    const page = data ?? []
    creditRows.push(...page)
    if (page.length < PAGE_SIZE) break
    creditFrom += PAGE_SIZE
  }

  const totalDebit = debitRows.reduce((sum, row) => sum + Number(row.amount), 0)
  const totalCredit = creditRows.reduce((sum, row) => sum + Number(row.amount), 0)

  return NextResponse.json({
    classified: tier1ClassifiedCount + tier2ClassifiedCount,
    tier1_classified: tier1ClassifiedCount,
    tier2_classified: tier2ClassifiedCount,
    needs_tier3: needsTier3Count,
    pending: 0,
    trial_balance: {
      balance: totalDebit === totalCredit,
      total_debit: totalDebit,
      total_credit: totalCredit,
    },
  })
}
