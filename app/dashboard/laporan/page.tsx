import { getTrialBalance } from '@/lib/reports/trialBalance'
import { buildIncomeStatement, buildBalanceSheet } from '@/lib/reports/financialStatements'
import { getReportNotes } from '@/lib/reports/notes'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { IncomeStatementCard } from '../_components/IncomeStatementCard'
import { BalanceSheetCard } from '../_components/BalanceSheetCard'
import { NotesCard } from '../_components/NotesCard'

// Tab "Laporan Keuangan" — reuse murni 3 kartu laporan yang sudah ada,
// tidak ada perubahan logic dari versi sebelumnya (cuma dipindah ke tab-nya
// sendiri, bukan ditumpuk di satu halaman panjang).
export default async function LaporanPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  // getTrialBalance (scan ledger_entries, ~300ms) dan getReportNotes (5 count
  // paralel, ~200ms) independen satu sama lain — jalankan bersamaan, bukan
  // berurutan (perf 18 Juli: ini tab dashboard paling lambat sebelumnya,
  // ~500-950ms end-to-end karena dua panggilan ini sekuensial).
  const [trialBalance, notes] = await Promise.all([getTrialBalance(umkmId), getReportNotes(umkmId)])
  const incomeStatement = buildIncomeStatement(trialBalance.rows)
  const balanceSheet = buildBalanceSheet(trialBalance.rows, incomeStatement.netIncome)

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Laporan Keuangan</h1>
        <p className="text-sm text-slate-500">Disusun otomatis dari data transaksi terklasifikasi (SAK EMKM)</p>
      </header>

      <IncomeStatementCard data={incomeStatement} />
      <BalanceSheetCard data={balanceSheet} />
      <NotesCard notes={notes} trialBalance={trialBalance} />
    </>
  )
}
