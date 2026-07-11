import { NextResponse } from 'next/server'
import { getTrialBalance } from '@/lib/reports/trialBalance'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const umkmId = searchParams.get('umkm_id')

  try {
    const result = await getTrialBalance(umkmId ?? undefined)
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
