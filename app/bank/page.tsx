import Link from 'next/link'
import { listSubmittedApplications, listDecidedApplications } from '@/lib/loanApplications/loanApplicationService'
import { formatDateID, formatRupiah } from '@/lib/format'

const SCORE_BADGE = {
  Hijau: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Kuning: 'bg-amber-50 text-amber-700 border border-amber-200',
  Merah: 'bg-red-50 text-red-700 border border-red-200',
} as const

const STATUS_BADGE = {
  submitted: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
} as const

const STATUS_TEXT = {
  submitted: 'Menunggu Keputusan',
  approved: 'Disetujui',
  rejected: 'Ditolak',
} as const

export default async function BankLoanListPage() {
  // Dua fetch independen — paralel (perf 18 Juli).
  const [pendingApps, decidedApps] = await Promise.all([listSubmittedApplications(), listDecidedApplications()])

  const totalPending = pendingApps.length
  const totalApproved = decidedApps.filter((a) => a.status === 'approved').length
  const totalRejected = decidedApps.filter((a) => a.status === 'rejected').length
  const totalApps = totalPending + decidedApps.length

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Panel Keputusan KUR</h1>
        <p className="text-sm text-slate-500">Evaluasi pengajuan pinjaman UMKM berbasis data transaksi digital secara real-time</p>
      </header>

      {/* Grid Statistik */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4" aria-label="Ringkasan Statistik">
        {/* Total */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pengajuan</span>
            <span className="rounded-lg bg-blue-50 p-2 text-blue-900">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" />
                <path d="M14 2v6h6" strokeLinecap="round" />
                <path d="M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{totalApps}</p>
        </div>

        {/* Pending */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Menunggu</span>
            <span className="rounded-lg bg-amber-50 p-2 text-amber-600">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{totalPending}</p>
        </div>

        {/* Approved */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Disetujui</span>
            <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" />
                <path d="M22 4 12 14.01l-3-3" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{totalApproved}</p>
        </div>

        {/* Rejected */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ditolak</span>
            <span className="rounded-lg bg-red-50 p-2 text-red-600">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" />
              </svg>
            </span>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-800">{totalRejected}</p>
        </div>
      </section>

      {/* Bagian 1: Pengajuan Aktif */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">Menunggu Verifikasi</h2>
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">{totalPending} aktif</span>
        </div>

        {pendingApps.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" className="mx-auto h-12 w-12 text-slate-300" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-500">Semua pengajuan telah diputuskan</p>
            <p className="text-xs text-slate-400">Tidak ada pengajuan baru yang menunggu keputusan saat ini.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">UMKM</th>
                    <th className="px-5 py-3.5">Nominal Pengajuan</th>
                    <th className="px-5 py-3.5">Tanggal Masuk</th>
                    <th className="px-5 py-3.5">Kategori Rapor / Skor</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{app.umkm_profiles?.business_name ?? '-'}</p>
                        <p className="text-xs text-slate-400">{app.umkm_profiles?.city ?? ''}</p>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold tabular-nums text-slate-700">{formatRupiah(app.requested_amount)}</td>
                      <td className="px-5 py-4 text-slate-500">{formatDateID(app.created_at)}</td>
                      <td className="px-5 py-4">
                        {app.credit_scores ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${SCORE_BADGE[app.credit_scores.score_category]}`}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                              app.credit_scores.score_category === 'Hijau' ? 'bg-emerald-500' :
                              app.credit_scores.score_category === 'Kuning' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            {app.credit_scores.score_category} · {app.credit_scores.score}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/bank/${app.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-900 px-4 text-xs font-bold text-white transition-colors hover:bg-blue-800"
                        >
                          Evaluasi →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Bagian 2: Riwayat Keputusan */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Riwayat Keputusan</h2>

        {decidedApps.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-slate-400">
            <p className="text-sm italic">Belum ada keputusan yang dibuat.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">UMKM</th>
                    <th className="px-5 py-3.5">Nominal Pengajuan</th>
                    <th className="px-5 py-3.5">Tanggal Keputusan</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {decidedApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-800">{app.umkm_profiles?.business_name ?? '-'}</p>
                        <p className="text-xs text-slate-400">{app.umkm_profiles?.city ?? ''}</p>
                      </td>
                      <td className="px-5 py-4 font-mono font-medium tabular-nums text-slate-600">{formatRupiah(app.requested_amount)}</td>
                      <td className="px-5 py-4 text-slate-500">{app.reviewed_at ? formatDateID(app.reviewed_at) : '-'}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[app.status as 'approved' | 'rejected']}`}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                            app.status === 'approved' ? 'bg-emerald-500' : 'bg-red-500'
                          }`} />
                          {STATUS_TEXT[app.status as 'approved' | 'rejected']}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/bank/${app.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  )
}
