import { NextResponse } from 'next/server'
import { listSubmittedApplications } from '@/lib/loanApplications/loanApplicationService'

// Namespace KHUSUS sisi bank — terpisah dari app/api/scoring/, app/api/gamification/,
// app/api/reports/ yang dipakai sisi UMKM. Halaman /bank sendiri memanggil
// listSubmittedApplications() langsung (Server Component, bukan self-fetch ke
// endpoint ini) — endpoint ini disediakan sebagai kontrak API yang bisa
// dites/dipakai terpisah dari UI.
export async function GET() {
  try {
    const applications = await listSubmittedApplications()
    return NextResponse.json({ applications })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
