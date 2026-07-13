import { getTrialBalance } from '@/lib/reports/trialBalance'
import { buildIncomeStatement, buildBalanceSheet } from '@/lib/reports/financialStatements'
import { getReportNotes } from '@/lib/reports/notes'
import { getCreditScore } from '@/lib/scoring/getCreditScore'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { IncomeStatementCard } from './_components/IncomeStatementCard'
import { BalanceSheetCard } from './_components/BalanceSheetCard'
import { NotesCard } from './_components/NotesCard'
import { SpeedometerCard } from './_components/SpeedometerCard'

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
  const creditScore = await getCreditScore(umkmId)

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-800">Laporan Keuangan</h1>
          <p className="text-sm text-slate-500">Disusun otomatis dari data transaksi terklasifikasi (SAK EMKM)</p>
        </header>

        <SpeedometerCard data={creditScore} />
        <IncomeStatementCard data={incomeStatement} />
        <BalanceSheetCard data={balanceSheet} />
        <NotesCard notes={notes} trialBalance={trialBalance} />
      </div>
    </div>
  )
}
