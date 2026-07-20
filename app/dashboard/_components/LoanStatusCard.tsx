import { formatDateID, formatRupiah } from '@/lib/format'
import type { LoanApplicationRow } from '@/lib/loanApplications/loanApplicationService'

const STATUS_STYLE = {
  submitted: { label: 'Menunggu keputusan bank', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  approved: { label: 'Disetujui', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  rejected: { label: 'Ditolak', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
} as const

function reviewDurationText(createdAt: string, reviewedAt: string): string {
  const ms = new Date(reviewedAt).getTime() - new Date(createdAt).getTime()
  const hours = ms / (1000 * 60 * 60)
  if (hours < 1) return `${Math.max(1, Math.round(ms / (1000 * 60)))} menit`
  if (hours < 24) return `${Math.round(hours)} jam`
  return `${Math.round(hours / 24)} hari`
}

export function LoanStatusCard({ application }: { application: LoanApplicationRow | null }) {
  if (!application) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <h2 className="text-lg font-semibold text-slate-800">Pengajuan KUR</h2>
        <p className="mt-2 text-sm italic text-slate-400">Belum ada pengajuan KUR — ajukan lewat tab &ldquo;Ajukan KUR&rdquo;.</p>
      </section>
    )
  }

  const style = STATUS_STYLE[application.status]

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Pengajuan KUR</h2>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {style.label}
        </span>
      </div>

      <div className="mt-3 space-y-1.5 text-sm">
        <p className="text-slate-600">
          Nominal diajukan: <strong className="font-mono tabular-nums text-slate-800">{formatRupiah(application.requested_amount)}</strong>
        </p>
        <p className="text-slate-500">Diajukan: {formatDateID(application.created_at)}</p>

        {application.reviewed_at && (
          <>
            <p className="text-slate-500">
              Diputuskan: {formatDateID(application.reviewed_at)} — proses verifikasi memakan{' '}
              <strong className="text-slate-700">{reviewDurationText(application.created_at, application.reviewed_at)}</strong>
              {' '}sejak diajukan.
            </p>
            {application.decision_notes && (
              <p className="rounded-md bg-slate-50 p-2.5 text-slate-600">Catatan analis: {application.decision_notes}</p>
            )}
          </>
        )}
      </div>
    </section>
  )
}
