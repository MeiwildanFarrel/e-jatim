import { supabaseAdmin } from '@/lib/supabase/server'

export type LoanStatus = 'submitted' | 'approved' | 'rejected'

export interface LoanApplicationRow {
  id: string
  umkm_id: string
  credit_score_id: string | null
  requested_amount: number
  status: LoanStatus
  bank_analyst_id: string | null
  reviewed_at: string | null
  decision_notes: string | null
  created_at: string
}

export interface LoanApplicationWithUmkm extends LoanApplicationRow {
  umkm_profiles: { business_name: string; city: string | null } | null
  credit_scores: { score: number; score_category: 'Hijau' | 'Kuning' | 'Merah' } | null
}

/** Baca pengajuan TERBARU milik satu UMKM, status apa pun — dipakai tab
 * Ringkasan & Ajukan KUR di dashboard UMKM untuk menampilkan riwayat. */
export async function getLatestLoanApplication(umkmId: string): Promise<LoanApplicationRow | null> {
  const { data, error } = await supabaseAdmin
    .from('loan_applications')
    .select('id, umkm_id, credit_score_id, requested_amount, status, bank_analyst_id, reviewed_at, decision_notes, created_at')
    .eq('umkm_id', umkmId)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  return (data?.[0] as LoanApplicationRow) ?? null
}

/**
 * Ajukan KUR baru. Mencegah pengajuan ganda: kalau UMKM ini masih punya
 * pengajuan berstatus 'submitted' (belum diputuskan bank), tolak dengan
 * pesan jelas — bukan diam-diam bikin baris duplikat. `credit_score_id`
 * diambil dari baris `credit_scores` TERBARU milik UMKM ini (harus sudah ada,
 * hasil dari alur consent — lihat creditScoreService.ts).
 */
export async function createLoanApplication(umkmId: string, requestedAmount: number): Promise<LoanApplicationRow> {
  const active = await getLatestLoanApplication(umkmId)
  if (active && active.status === 'submitted') {
    throw new Error('Anda masih punya pengajuan KUR yang sedang diproses — tunggu keputusan bank sebelum mengajukan lagi.')
  }

  const { data: scoreRows, error: scoreError } = await supabaseAdmin
    .from('credit_scores')
    .select('id')
    .eq('umkm_id', umkmId)
    .order('calculated_at', { ascending: false })
    .limit(1)
  if (scoreError) throw new Error(scoreError.message)

  const creditScoreId = scoreRows?.[0]?.id ?? null
  if (!creditScoreId) {
    throw new Error('Skor kredit belum tersedia — selesaikan alur consent terlebih dahulu sebelum mengajukan KUR.')
  }

  const { data, error } = await supabaseAdmin
    .from('loan_applications')
    .insert({
      umkm_id: umkmId,
      credit_score_id: creditScoreId,
      requested_amount: requestedAmount,
      status: 'submitted',
    })
    .select('id, umkm_id, credit_score_id, requested_amount, status, bank_analyst_id, reviewed_at, decision_notes, created_at')
    .single()

  if (error) throw new Error(error.message)
  return data as LoanApplicationRow
}

/** Daftar pengajuan yang MENUNGGU keputusan bank (status='submitted') —
 * dipakai halaman list `/bank`. */
export async function listSubmittedApplications(): Promise<LoanApplicationWithUmkm[]> {
  const { data, error } = await supabaseAdmin
    .from('loan_applications')
    .select(
      'id, umkm_id, credit_score_id, requested_amount, status, bank_analyst_id, reviewed_at, decision_notes, created_at, umkm_profiles(business_name, city), credit_scores(score, score_category)'
    )
    .eq('status', 'submitted')
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as LoanApplicationWithUmkm[]
}

/** Satu pengajuan + identitas UMKM-nya — dipakai halaman detail `/bank/[id]`. */
export async function getLoanApplicationById(id: string): Promise<LoanApplicationWithUmkm | null> {
  const { data, error } = await supabaseAdmin
    .from('loan_applications')
    .select(
      'id, umkm_id, credit_score_id, requested_amount, status, bank_analyst_id, reviewed_at, decision_notes, created_at, umkm_profiles(business_name, city), credit_scores(score, score_category)'
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    throw new Error(error.message)
  }
  return data as unknown as LoanApplicationWithUmkm
}

/**
 * Analis (persona demo "Pak Arief", lihat DEMO_BANK_ANALYST_NAME di
 * constants.ts) memutuskan pengajuan. `reviewed_at` diisi saat ini —
 * selisih `created_at` → `reviewed_at` inilah yang jadi bukti visual
 * verifikasi cepat (menit/jam di demo, kontras terhadap 14-30 hari manual di
 * narasi Bab 3).
 *
 * `bank_analyst_id` sengaja TIDAK diisi (NULL) — kolom ini ternyata punya FK
 * constraint nyata ke `auth.users` (`loan_applications_bank_analyst_id_fkey`,
 * ditemukan 14 Juli, BEDA dari asumsi awal PRD.md §4.1 yang mengira ini uuid
 * bebas). Tidak ada baris `auth.users` untuk persona demo "Pak Arief" — nama
 * analis ditampilkan di UI sebagai label statis, terpisah dari data tersimpan
 * (lihat DEMO_BANK_ANALYST_NAME).
 */
export async function decideLoanApplication(
  id: string,
  status: Extract<LoanStatus, 'approved' | 'rejected'>,
  decisionNotes: string | null
): Promise<LoanApplicationRow> {
  const { data, error } = await supabaseAdmin
    .from('loan_applications')
    .update({
      status,
      reviewed_at: new Date().toISOString(),
      bank_analyst_id: null,
      decision_notes: decisionNotes,
    })
    .eq('id', id)
    .select('id, umkm_id, credit_score_id, requested_amount, status, bank_analyst_id, reviewed_at, decision_notes, created_at')
    .single()

  if (error) throw new Error(error.message)
  return data as LoanApplicationRow
}
