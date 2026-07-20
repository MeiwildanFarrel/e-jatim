import { getGamificationProgress } from '@/lib/gamification/gamificationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { GamificationCard } from '../_components/GamificationCard'
import { refreshStreak } from './actions'

// Tab "Progres & Tantangan" — reuse murni logic streakCalculator/
// gamificationService (tidak diubah). Performa (18 Juli): halaman ini
// sekarang MEMBACA nilai tersimpan (getGamificationProgress, ~65ms),
// bukan menghitung ulang dari seluruh transaksi tiap render seperti
// sebelumnya (~530ms dan terus memburuk seiring data bertambah). Hitung
// ulang sungguhan dipicu di 3 tempat: consent, /api/mock-snap/ingest,
// dan tombol refresh manual di bawah.
export default async function ProgresPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const gamification = await getGamificationProgress(umkmId)

  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-800">Progres &amp; Tantangan</h1>
          <p className="text-sm text-slate-500">Kebiasaan mencatat transaksi harian secara rutin</p>
        </div>
        <form action={refreshStreak}>
          <input type="hidden" name="umkm_id" value={umkmId} />
          <button
            type="submit"
            className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M4 4v5h5M20 20v-5h-5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4.5 9a7.5 7.5 0 0 1 12.8-4.9M19.5 15a7.5 7.5 0 0 1-12.8 4.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Refresh
          </button>
        </form>
      </header>

      <GamificationCard data={gamification} />
    </>
  )
}
