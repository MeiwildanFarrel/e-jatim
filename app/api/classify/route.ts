import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { classifyTransaction } from '@/lib/classifier/tier1Classifier'

interface TransactionRow {
  id: string
  umkm_id: string
  source: string
  amount: number
  transaction_type: 'in' | 'out'
  raw_description: string
  transaction_date: string
}

function toPeriodMonth(transactionDate: string): string {
  const date = new Date(transactionDate)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

export async function POST() {
  const { data: transactions, error: fetchError } = await supabaseAdmin
    .from('transactions')
    .select('id, umkm_id, source, amount, transaction_type, raw_description, transaction_date')
    .eq('classification_status', 'pending')

  if (fetchError) {
    return NextResponse.json({ status: 'error', message: fetchError.message }, { status: 500 })
  }

  let classifiedCount = 0
  let pendingCount = 0

  for (const trx of (transactions ?? []) as TransactionRow[]) {
    const result = classifyTransaction(trx.raw_description, trx.transaction_type, trx.source)

    if (!result.matched || !result.entries) {
      pendingCount++
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

    classifiedCount++
  }

  const { data: debitRows, error: debitError } = await supabaseAdmin
    .from('ledger_entries')
    .select('amount')
    .eq('entry_side', 'debit')

  const { data: creditRows, error: creditError } = await supabaseAdmin
    .from('ledger_entries')
    .select('amount')
    .eq('entry_side', 'credit')

  if (debitError || creditError) {
    return NextResponse.json(
      { status: 'error', message: debitError?.message ?? creditError?.message },
      { status: 500 }
    )
  }

  const totalDebit = (debitRows ?? []).reduce((sum, row) => sum + Number(row.amount), 0)
  const totalCredit = (creditRows ?? []).reduce((sum, row) => sum + Number(row.amount), 0)

  return NextResponse.json({
    classified: classifiedCount,
    pending: pendingCount,
    trial_balance: {
      balance: totalDebit === totalCredit,
      total_debit: totalDebit,
      total_credit: totalCredit,
    },
  })
}
