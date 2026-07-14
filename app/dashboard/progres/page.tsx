import { computeAndSaveStreak } from '@/lib/gamification/gamificationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { GamificationCard } from '../_components/GamificationCard'

// Tab "Progres & Tantangan" — reuse murni GamificationCard, tidak ada
// perubahan logic streak.
export default async function ProgresPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const gamification = await computeAndSaveStreak(umkmId)

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Progres &amp; Tantangan</h1>
        <p className="text-sm text-slate-500">Kebiasaan mencatat transaksi harian secara rutin</p>
      </header>

      <GamificationCard data={gamification} />
    </>
  )
}
