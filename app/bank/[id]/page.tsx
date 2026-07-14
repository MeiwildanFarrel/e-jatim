import { notFound } from 'next/navigation'
import { getLoanApplicationById } from '@/lib/loanApplications/loanApplicationService'
import { getTrialBalance } from '@/lib/reports/trialBalance'
import { buildIncomeStatement, buildBalanceSheet } from '@/lib/reports/financialStatements'
import { getReportNotes } from '@/lib/reports/notes'
import { getCreditScore } from '@/lib/scoring/getCreditScore'
import { formatDateID, formatRupiah } from '@/lib/format'
import { DEMO_BANK_ANALYST_NAME } from '@/lib/constants'
// Reuse langsung dari app/dashboard/_components — SATU-SATUNYA sumber logic
// tampilan laporan/skor, tidak diduplikasi/ditulis ulang untuk sisi bank.
import { IncomeStatementCard } from '../../dashboard/_components/IncomeStatementCard'
import { BalanceSheetCard } from '../../dashboard/_components/BalanceSheetCard'
import { NotesCard } from '../../dashboard/_components/NotesCard'
import { SpeedometerCard } from '../../dashboard/_components/SpeedometerCard'
import { DecisionButtons } from './DecisionButtons'

const STATUS_LABEL = {
  submitted: { text: 'Menunggu keputusan', badge: 'bg-amber-50 text-amber-700' },
  approved: { text: 'Disetujui', badge: 'bg-emerald-50 text-emerald-700' },
  rejected: { text: 'Ditolak', badge: 'bg-red-50 text-red-700' },
} as const

function reviewDurationText(createdAt: string, reviewedAt: string): string {
  const ms = new Date(reviewedAt).getTime() - new Date(createdAt).getTime()
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) return `${Math.max(1, Math.round(ms / (1000 * 60)))} menit`
  if (hours < 24) return `${Math.round(hours)} jam`
  return `${Math.round(hours / 24)} hari`
}

export default async function BankLoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const application = await getLoanApplicationById(id)
  if (!application) notFound()

  const umkmId = application.umkm_id
  const trialBalance = await getTrialBalance(umkmId)
  const incomeStatement = buildIncomeStatement(trialBalance.rows)
  const balanceSheet = buildBalanceSheet(trialBalance.rows, incomeStatement.netIncome)
  const notes = await getReportNotes(umkmId)
  const creditScore = await getCreditScore(umkmId)

  const status = STATUS_LABEL[application.status]

  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{application.umkm_profiles?.business_name ?? 'UMKM'}</h1>
          <p className="text-sm text-slate-500">
            {application.umkm_profiles?.city ?? ''} · Mengajukan {formatRupiah(application.requested_amount)} pada{' '}
            {formatDateID(application.created_at)}
          </p>
        </div>
        <span className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-semibold ${status.badge}`}>
          {status.text}
        </span>
      </header>

      {application.status === 'submitted' ? (
        <DecisionButtons applicationId={application.id} />
      ) : (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">Keputusan</h2>
          <p className="mt-2 text-sm text-slate-600">
            Diputuskan oleh {DEMO_BANK_ANALYST_NAME} pada {formatDateID(application.reviewed_at!)} — proses verifikasi
            memakan{' '}
            <strong className="text-slate-800">{reviewDurationText(application.created_at, application.reviewed_at!)}</strong>{' '}
            sejak diajukan (dibandingkan proses manual 14-30 hari).
          </p>
          {application.decision_notes && (
            <p className="mt-2 rounded-md bg-slate-50 p-3 text-sm text-slate-600">Catatan: {application.decision_notes}</p>
          )}
        </section>
      )}

      <SpeedometerCard data={creditScore} />
      <IncomeStatementCard data={incomeStatement} />
      <BalanceSheetCard data={balanceSheet} />
      <NotesCard notes={notes} trialBalance={trialBalance} />
    </>
  )
}
