import { NextResponse } from 'next/server'
import { computeAndSaveStreak } from '@/lib/gamification/gamificationService'
import { DEFAULT_UMKM_ID } from '@/lib/constants'

// Endpoint manual untuk (re)hitung & simpan streak "pencatatan_konsisten" —
// dashboard sudah memanggil ini otomatis tiap render (lihat
// app/dashboard/page.tsx), endpoint ini untuk verifikasi/re-run tanpa UI.
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const umkmId = searchParams.get('umkm_id') ?? DEFAULT_UMKM_ID

  try {
    const result = await computeAndSaveStreak(umkmId)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
