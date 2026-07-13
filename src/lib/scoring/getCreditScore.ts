import { supabaseAdmin } from '@/lib/supabase/server'

export interface CreditScoreRow {
  score: number
  score_category: 'Hijau' | 'Kuning' | 'Merah'
  growth_score: number
  stability_score: number
  reputation_score: number | null
  risk_factor_score: number
  calculated_at: string
  model_version: string
}

/**
 * Baca skor ACS TERSIMPAN (bukan hitung ulang) — dipakai dashboard untuk
 * render speedometer. Perhitungan sungguhan terjadi di
 * creditScoreService.saveCreditScore(), dipicu dari alur consent.
 */
export async function getCreditScore(umkmId: string): Promise<CreditScoreRow | null> {
  const { data, error } = await supabaseAdmin
    .from('credit_scores')
    .select('score, score_category, growth_score, stability_score, reputation_score, risk_factor_score, calculated_at, model_version')
    .eq('umkm_id', umkmId)
    .order('calculated_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  return (data?.[0] as CreditScoreRow) ?? null
}
