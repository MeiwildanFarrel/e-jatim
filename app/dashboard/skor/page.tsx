import { getCreditScore } from '@/lib/scoring/getCreditScore'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { SpeedometerCard } from '../_components/SpeedometerCard'

// Tab "Skor Kredit" — reuse murni SpeedometerCard, tidak ada perhitungan baru.
export default async function SkorPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const creditScore = await getCreditScore(umkmId)

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Skor Kredit</h1>
        <p className="text-sm text-slate-500">Skor kredit alternatif (ACS) beserta rincian komponennya</p>
      </header>

      <SpeedometerCard data={creditScore} />
    </>
  )
}
