// Kalkulasi streak "Rapor Sehat Keuangan" (F5) — logic murni TypeScript dari
// tanggal transaksi real, bukan AI, bukan hardcode. challenge_type PoC:
// 'pencatatan_konsisten' — mengukur kebiasaan mencatat transaksi rutin
// (bukan kualitas klasifikasi), jadi "aktivitas" = ada minimal satu baris di
// `transactions` pada tanggal itu, terlepas dari classification_status-nya.

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcMidnight(dateStr: string): number {
  // dateStr format 'YYYY-MM-DD' — dibandingkan sebagai hari kalender UTC,
  // konsisten dengan toPeriodMonth() di classify route & creditScoreService.
  const [y, m, d] = dateStr.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export interface StreakResult {
  currentStreak: number
  longestStreak: number
  lastActivityDate: string | null // 'YYYY-MM-DD', null kalau belum pernah ada aktivitas
}

/**
 * @param activityDates tanggal ('YYYY-MM-DD') hari-hari yang punya minimal 1
 *   transaksi tercatat — boleh belum unik/urut, fungsi ini yang menormalkan.
 * @param referenceDate "hari ini" dari sudut pandang caller (default = waktu
 *   render). Dipisah jadi parameter (bukan langsung `new Date()` di dalam)
 *   supaya fungsi ini tetap murni/testable, sama seperti pola di
 *   creditScoreService.ts.
 */
export function computeStreak(activityDates: string[], referenceDate: Date = new Date()): StreakResult {
  const uniqueDays = [...new Set(activityDates)].sort()
  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActivityDate: null }
  }

  // Longest streak: scan semua hari terurut, hitung run terpanjang di mana
  // tiap hari persis 1 hari setelah hari sebelumnya.
  let longestStreak = 1
  let runLength = 1
  for (let i = 1; i < uniqueDays.length; i++) {
    const gapDays = (toUtcMidnight(uniqueDays[i]) - toUtcMidnight(uniqueDays[i - 1])) / MS_PER_DAY
    runLength = gapDays === 1 ? runLength + 1 : 1
    longestStreak = Math.max(longestStreak, runLength)
  }

  const lastActivityDate = uniqueDays[uniqueDays.length - 1]

  // Current streak: hitung run mundur dari hari aktivitas TERAKHIR (bukan
  // dari referenceDate), lalu cek apakah run itu masih "hidup" — diberi masa
  // tenggang 1 hari (last activity = kemarin dianggap tetap hidup, karena
  // hari ini belum tentu berakhir saat dashboard dibuka). Kalau aktivitas
  // terakhir sudah >=2 hari lalu, streak dianggap PUTUS -> currentStreak 0,
  // meski longestStreak historis tetap dilaporkan apa adanya.
  const daysSinceLastActivity = Math.floor(
    (toUtcMidnight(referenceDate.toISOString().slice(0, 10)) - toUtcMidnight(lastActivityDate)) / MS_PER_DAY
  )

  if (daysSinceLastActivity > 1) {
    return { currentStreak: 0, longestStreak, lastActivityDate }
  }

  let trailingRun = 1
  for (let i = uniqueDays.length - 1; i > 0; i--) {
    const gapDays = (toUtcMidnight(uniqueDays[i]) - toUtcMidnight(uniqueDays[i - 1])) / MS_PER_DAY
    if (gapDays === 1) {
      trailingRun++
    } else {
      break
    }
  }

  return { currentStreak: trailingRun, longestStreak, lastActivityDate }
}

export const CHALLENGE_TARGET_DAYS = 30
export type NotificationTone = 'reset' | 'progress' | 'completed'

export interface StreakNotification {
  tone: NotificationTone
  message: string
}

/**
 * 3 kondisi pemicu notifikasi, dipetakan langsung ke konsep "Tantangan 30
 * Hari" (F5):
 * 1. currentStreak === 0 -> streak putus (atau belum pernah mulai) -> ajakan
 *    mulai/lanjut lagi.
 * 2. 0 < currentStreak < 30 -> masih berjalan -> progres + sisa hari.
 * 3. currentStreak >= 30 -> tantangan 30 hari selesai -> selebrasi.
 */
export function buildStreakNotification(streak: StreakResult): StreakNotification {
  if (streak.currentStreak === 0) {
    return {
      tone: 'reset',
      message: streak.lastActivityDate
        ? `Pencatatan terakhir tercatat ${streak.lastActivityDate}. Catat transaksi hari ini untuk memulai rentetan baru!`
        : 'Belum ada transaksi tercatat. Mulai catat transaksi hari ini untuk memulai Tantangan 30 Hari!',
    }
  }

  if (streak.currentStreak >= CHALLENGE_TARGET_DAYS) {
    return {
      tone: 'completed',
      message: `Selamat! Tantangan 30 Hari selesai — pencatatan konsisten ${streak.currentStreak} hari berturut-turut.`,
    }
  }

  const remaining = CHALLENGE_TARGET_DAYS - streak.currentStreak
  return {
    tone: 'progress',
    message: `Pencatatan konsisten ${streak.currentStreak} hari berturut-turut. ${remaining} hari lagi menuju Tantangan 30 Hari!`,
  }
}
