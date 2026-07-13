import { NextResponse } from 'next/server'
import { saveCreditScore } from '@/lib/scoring/creditScoreService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'

// Endpoint manual untuk (re)hitung & simpan skor ACS dari ledger real —
// dipanggil otomatis oleh alur consent (app/consent/actions.ts), tapi juga
// bisa dipanggil langsung untuk verifikasi/re-run tanpa lewat UI.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const umkmId = searchParams.get('umkm_id') ?? DEFAULT_UMKM_ID

  try {
    const result = await saveCreditScore(umkmId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
