import { supabaseAdmin } from '@/lib/supabase/server'

interface LedgerEntryWithAccount {
  account_code: string
  entry_side: 'debit' | 'credit'
  amount: number
  chart_of_accounts: {
    account_name: string
    account_type: string
    normal_balance: string
  } | null
}

export interface TrialBalanceRow {
  account_code: string
  account_name: string
  account_type: string
  normal_balance: string
  total_debit: number
  total_kredit: number
  saldo_akhir: number
}

export interface TrialBalanceResult {
  generated_at: string
  rows: TrialBalanceRow[]
  total_debit: number
  total_kredit: number
  is_balance: boolean
}

const BALANCE_TOLERANCE = 1
const PAGE_SIZE = 1000

/**
 * Dipakai bersama oleh app/api/reports/trial-balance (endpoint publik) dan
 * app/dashboard (Server Component) — satu sumber logic, tidak diduplikasi.
 */
export async function getTrialBalance(umkmId?: string): Promise<TrialBalanceResult> {
  // PostgREST caps unpaginated responses at 1000 rows by default — page through
  // with .range() so a large ledger isn't silently truncated (GOTCHA #4).
  const allEntries: LedgerEntryWithAccount[] = []
  let from = 0
  while (true) {
    let query = supabaseAdmin
      .from('ledger_entries')
      .select('account_code, entry_side, amount, chart_of_accounts(account_name, account_type, normal_balance)')
      .range(from, from + PAGE_SIZE - 1)

    if (umkmId) {
      query = query.eq('umkm_id', umkmId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    const page = (data ?? []) as unknown as LedgerEntryWithAccount[]
    allEntries.push(...page)

    if (page.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const accountMap = new Map<string, TrialBalanceRow>()

  for (const entry of allEntries) {
    const row = accountMap.get(entry.account_code) ?? {
      account_code: entry.account_code,
      account_name: entry.chart_of_accounts?.account_name ?? '',
      account_type: entry.chart_of_accounts?.account_type ?? '',
      normal_balance: entry.chart_of_accounts?.normal_balance ?? '',
      total_debit: 0,
      total_kredit: 0,
      saldo_akhir: 0,
    }

    if (entry.entry_side === 'debit') {
      row.total_debit += Number(entry.amount)
    } else {
      row.total_kredit += Number(entry.amount)
    }

    accountMap.set(entry.account_code, row)
  }

  const rows = Array.from(accountMap.values())
    .map((row) => ({ ...row, saldo_akhir: row.total_debit - row.total_kredit }))
    .sort((a, b) => a.account_code.localeCompare(b.account_code))

  const total_debit = rows.reduce((sum, row) => sum + row.total_debit, 0)
  const total_kredit = rows.reduce((sum, row) => sum + row.total_kredit, 0)
  const is_balance = Math.abs(total_debit - total_kredit) < BALANCE_TOLERANCE

  return {
    generated_at: new Date().toISOString(),
    rows,
    total_debit,
    total_kredit,
    is_balance,
  }
}
