import { getLatestLoanApplication } from '@/lib/loanApplications/loanApplicationService'
import { DEFAULT_UMKM_ID, DEMO_KUR_REQUESTED_AMOUNT } from '@/lib/constants'
import { formatRupiah } from '@/lib/format'
import { LoanStatusCard } from '../_components/LoanStatusCard'
import { submitLoanApplication } from './actions'

// Tab "Ajukan KUR" — F6 Bagian 1 (sisi UMKM). Reuse LoanStatusCard untuk
// menampilkan riwayat/status; tombol pengajuan baru hanya tampil kalau tidak
// ada pengajuan yang masih 'submitted' (guard ganda juga ada di server
// action, ini cuma supaya UI tidak menampilkan tombol yang pasti ditolak).
export default async function AjukanKurPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const latestApplication = await getLatestLoanApplication(umkmId)
  const hasActiveApplication = latestApplication?.status === 'submitted'

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Ajukan KUR</h1>
        <p className="text-sm text-slate-500">
          Ajukan pembiayaan modal usaha ke Bank Jatim berdasarkan laporan keuangan dan skor kredit Anda
        </p>
      </header>

      <LoanStatusCard application={latestApplication} />

      {!hasActiveApplication && (
        <section className="rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-800">
            {latestApplication ? 'Ajukan KUR Baru' : 'Ajukan KUR'}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Pengajuan akan dikirim ke Bank Jatim beserta laporan keuangan dan skor kredit Anda saat ini. Nominal
            pengajuan: <strong className="tabular-nums text-slate-700">{formatRupiah(DEMO_KUR_REQUESTED_AMOUNT)}</strong>.
          </p>
          <form action={submitLoanApplication} className="mt-4">
            <input type="hidden" name="umkm_id" value={umkmId} />
            <button
              type="submit"
              className="h-12 w-full rounded-xl bg-blue-900 text-base font-semibold text-white transition-colors hover:bg-blue-800 sm:w-auto sm:px-8"
            >
              Ajukan Sekarang
            </button>
          </form>
        </section>
      )}
    </>
  )
}
