import { getCreditScore } from '@/lib/scoring/getCreditScore'
import { getLatestLoanApplication } from '@/lib/loanApplications/loanApplicationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { SpeedometerCard } from './_components/SpeedometerCard'
import { LoanStatusCard } from './_components/LoanStatusCard'

// Tab "Ringkasan" — overview singkat: skor + status pengajuan KUR kalau ada.
// Laporan lengkap (3 laporan SAK EMKM) & progres tantangan punya tab sendiri.
export default async function RingkasanPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  // Dua fetch independen — paralel, bukan sekuensial (perf 18 Juli).
  const [creditScore, latestApplication] = await Promise.all([
    getCreditScore(umkmId),
    getLatestLoanApplication(umkmId),
  ])

  return (
    <>
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Ringkasan</h1>
        <p className="text-sm text-slate-500">Kondisi usaha Anda sekilas: skor kredit dan status pengajuan KUR</p>
      </header>

      <SpeedometerCard data={creditScore} variant="hero" />
      <LoanStatusCard application={latestApplication} />
    </>
  )
}
