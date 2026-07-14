import Link from 'next/link'
import { listSubmittedApplications } from '@/lib/loanApplications/loanApplicationService'
import { formatDateID, formatRupiah } from '@/lib/format'

const SCORE_BADGE = {
  Hijau: 'bg-emerald-50 text-emerald-700',
  Kuning: 'bg-amber-50 text-amber-700',
  Merah: 'bg-red-50 text-red-700',
} as const

export default async function BankLoanListPage() {
  const applications = await listSubmittedApplications()

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Daftar Pengajuan</h1>
        <p className="text-sm text-slate-500">Pengajuan KUR yang menunggu keputusan — {applications.length} pengajuan</p>
      </header>

      {applications.length === 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <p className="text-sm italic text-slate-400">Tidak ada pengajuan yang menunggu keputusan saat ini.</p>
        </section>
      ) : (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">UMKM</th>
                  <th className="px-4 py-3">Nominal</th>
                  <th className="px-4 py-3">Tanggal masuk</th>
                  <th className="px-4 py-3">Skor</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{app.umkm_profiles?.business_name ?? '-'}</p>
                      <p className="text-xs text-slate-400">{app.umkm_profiles?.city ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">{formatRupiah(app.requested_amount)}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDateID(app.created_at)}</td>
                    <td className="px-4 py-3">
                      {app.credit_scores ? (
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${SCORE_BADGE[app.credit_scores.score_category]}`}>
                          {app.credit_scores.score_category} · {app.credit_scores.score}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/bank/${app.id}`} className="text-sm font-semibold text-blue-900 hover:underline">
                        Lihat detail →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
