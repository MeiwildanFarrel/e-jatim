import type { TrialBalanceRow } from './trialBalance'

export interface AccountLine {
  account_code: string
  account_name: string
  amount: number
}

export interface IncomeStatement {
  revenues: AccountLine[]
  totalRevenue: number
  expenses: AccountLine[]
  totalExpense: number
  netIncome: number
}

export interface BalanceSheet {
  assets: AccountLine[]
  totalAssets: number
  liabilities: AccountLine[]
  totalLiabilities: number
  equity: AccountLine[]
  totalEquity: number
  isBalanced: boolean
  difference: number
}

const BALANCE_TOLERANCE = 1

// saldo_akhir dari trial balance = total_debit - total_kredit. Untuk akun
// credit-normal (Pendapatan, Liabilitas, sebagian besar Modal), ini akan
// negatif kalau akunnya "sehat" — dibalik di sini supaya nilai yang
// ditampilkan positif saat akun berada di sisi normalnya (mis. Pendapatan
// positif, bukan minus).
function normalizedAmount(row: TrialBalanceRow): number {
  return row.normal_balance === 'credit' ? -row.saldo_akhir : row.saldo_akhir
}

function toLines(rows: TrialBalanceRow[]): AccountLine[] {
  return rows.map((row) => ({
    account_code: row.account_code,
    account_name: row.account_name,
    amount: normalizedAmount(row),
  }))
}

export function buildIncomeStatement(rows: TrialBalanceRow[]): IncomeStatement {
  const revenues = toLines(rows.filter((r) => r.account_type === 'Revenue'))
  const expenses = toLines(rows.filter((r) => r.account_type === 'Expense'))

  const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0)
  const totalExpense = expenses.reduce((sum, r) => sum + r.amount, 0)

  return {
    revenues,
    totalRevenue,
    expenses,
    totalExpense,
    netIncome: totalRevenue - totalExpense,
  }
}

/**
 * Ledger ini belum pernah "ditutup" (belum ada jurnal penutup akhir periode),
 * jadi akun Pendapatan/Beban masih terbuka di trial balance. Supaya
 * Aset = Liabilitas + Modal benar-benar balance (bukan cuma tampilan),
 * Laba/Rugi berjalan (dari buildIncomeStatement) dimasukkan sebagai baris
 * Modal — ini praktik standar untuk neraca interim/belum ditutup, dan
 * mengikuti langsung dari invariant trial balance (Σdebit = Σkredit):
 * Aset + Beban = Liabilitas + Modal(akun) + Pendapatan
 * => Aset = Liabilitas + [Modal(akun) + (Pendapatan - Beban)]
 */
export function buildBalanceSheet(rows: TrialBalanceRow[], netIncome: number): BalanceSheet {
  const assets = toLines(rows.filter((r) => r.account_type === 'Asset'))
  const liabilities = toLines(rows.filter((r) => r.account_type === 'Liability'))
  const equityFromAccounts = toLines(rows.filter((r) => r.account_type === 'Equity'))

  const equity: AccountLine[] = [
    ...equityFromAccounts,
    { account_code: '', account_name: 'Laba (Rugi) Tahun Berjalan', amount: netIncome },
  ]

  const totalAssets = assets.reduce((sum, r) => sum + r.amount, 0)
  const totalLiabilities = liabilities.reduce((sum, r) => sum + r.amount, 0)
  const totalEquity = equity.reduce((sum, r) => sum + r.amount, 0)

  const difference = totalAssets - (totalLiabilities + totalEquity)

  return {
    assets,
    totalAssets,
    liabilities,
    totalLiabilities,
    equity,
    totalEquity,
    isBalanced: Math.abs(difference) < BALANCE_TOLERANCE,
    difference,
  }
}
