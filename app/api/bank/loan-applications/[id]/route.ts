import { NextResponse } from 'next/server'
import { getLoanApplicationById, decideLoanApplication } from '@/lib/loanApplications/loanApplicationService'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const application = await getLoanApplicationById(id)
    if (!application) {
      return NextResponse.json({ status: 'error', message: 'Pengajuan tidak ditemukan' }, { status: 404 })
    }
    return NextResponse.json(application)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}

// Dipanggil oleh tombol Setujui/Tolak di /bank/[id] (client component,
// lihat DecisionButtons.tsx) — satu-satunya cara status loan_applications
// berubah, memastikan reviewed_at & bank_analyst_id selalu konsisten
// (lihat decideLoanApplication di loanApplicationService.ts).
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ status: 'error', message: 'Body harus JSON valid' }, { status: 400 })
  }

  const { status, decision_notes } = (body ?? {}) as { status?: string; decision_notes?: string }
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ status: 'error', message: "Field 'status' harus 'approved' atau 'rejected'" }, { status: 400 })
  }

  try {
    const updated = await decideLoanApplication(id, status, decision_notes?.trim() || null)
    return NextResponse.json(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
