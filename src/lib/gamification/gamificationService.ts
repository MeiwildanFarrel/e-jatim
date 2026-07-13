import { supabaseAdmin } from '@/lib/supabase/server'
import { computeStreak, type StreakResult } from './streakCalculator'

const PAGE_SIZE = 1000
const CHALLENGE_TYPE = 'pencatatan_konsisten'

async function fetchActivityDates(umkmId: string): Promise<string[]> {
  const dates: string[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('transaction_date')
      .eq('umkm_id', umkmId)
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw new Error(error.message)

    const page = data ?? []
    dates.push(...page.map((row) => (row.transaction_date as string).slice(0, 10)))
    if (page.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return dates
}

export interface GamificationProgress extends StreakResult {
  challengeType: string
  updatedAt: string
}

/**
 * Hitung streak "pencatatan_konsisten" dari `transactions` real, lalu simpan
 * ke `gamification_progress`. Dipanggil dari Server Component dashboard
 * setiap render (bukan lewat trigger terpisah seperti consent->skor ACS) —
 * tabel ini tidak punya titik pemicu alami di alur PoC, dan menghitung ulang
 * tiap load itu murah (satu query paginated) sekaligus menjaga data selalu
 * mutakhir tanpa job terjadwal terpisah. TIDAK ada unique constraint yang
 * diasumsikan di `gamification_progress`, jadi upsert dilakukan manual:
 * select baris (umkm_id, challenge_type) dulu, update kalau ada, insert
 * kalau belum.
 */
export async function computeAndSaveStreak(umkmId: string, referenceDate: Date = new Date()): Promise<GamificationProgress> {
  const activityDates = await fetchActivityDates(umkmId)
  const streak = computeStreak(activityDates, referenceDate)
  const updatedAt = new Date().toISOString()

  const { data: existing, error: existingError } = await supabaseAdmin
    .from('gamification_progress')
    .select('id')
    .eq('umkm_id', umkmId)
    .eq('challenge_type', CHALLENGE_TYPE)
    .limit(1)

  if (existingError) throw new Error(existingError.message)

  const payload = {
    current_streak: streak.currentStreak,
    longest_streak: streak.longestStreak,
    last_activity_date: streak.lastActivityDate,
    updated_at: updatedAt,
  }

  if (existing && existing.length > 0) {
    const { error } = await supabaseAdmin.from('gamification_progress').update(payload).eq('id', existing[0].id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabaseAdmin
      .from('gamification_progress')
      .insert({ umkm_id: umkmId, challenge_type: CHALLENGE_TYPE, ...payload })
    if (error) throw new Error(error.message)
  }

  return { ...streak, challengeType: CHALLENGE_TYPE, updatedAt }
}
