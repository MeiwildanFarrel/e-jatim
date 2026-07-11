import { getTrialBalance } from '@/lib/reports/trialBalance'
import { buildIncomeStatement, buildBalanceSheet } from '@/lib/reports/financialStatements'
import { getReportNotes } from '@/lib/reports/notes'
import { IncomeStatementCard } from './_components/IncomeStatementCard'
import { BalanceSheetCard } from './_components/BalanceSheetCard'
import { NotesCard } from './_components/NotesCard'

// PoC: satu-satunya UMKM dengan data saat ini (Nasi Campur Bu Sari). Logic
// laporan di bawah generik terhadap umkm_id manapun — ini cuma fallback
// default kalau ?umkm_id= tidak diberikan di URL.
const DEFAULT_UMKM_ID = '71d869df-7a97-4d29-af8c-40bc55f895bf'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const trialBalance = await getTrialBalance(umkmId)
  const incomeStatement = buildIncomeStatement(trialBalance.rows)
  const balanceSheet = buildBalanceSheet(trialBalance.rows, incomeStatement.netIncome)
  const notes = await getReportNotes(umkmId)

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-800">Laporan Keuangan</h1>
          <p className="text-sm text-slate-500">Disusun otomatis dari data transaksi terklasifikasi (SAK EMKM)</p>
        </header>

        <IncomeStatementCard data={incomeStatement} />
        <BalanceSheetCard data={balanceSheet} />
        <NotesCard notes={notes} trialBalance={trialBalance} />
      </div>
    </div>
  )
}
