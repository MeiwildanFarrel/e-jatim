import { formatDateID } from '@/lib/format'
import { buildStreakNotification, CHALLENGE_TARGET_DAYS } from '@/lib/gamification/streakCalculator'
import type { GamificationProgress } from '@/lib/gamification/gamificationService'

const NOTIFICATION_STYLE = {
  reset: 'bg-amber-50 text-amber-800',
  progress: 'bg-blue-50 text-blue-900',
  completed: 'bg-emerald-50 text-emerald-700',
} as const

export function GamificationCard({ data }: { data: GamificationProgress }) {
  const notification = buildStreakNotification(data)
  const isCompleted = notification.tone === 'completed'
  const filledBoxes = Math.min(data.currentStreak, CHALLENGE_TARGET_DAYS)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Tantangan 30 Hari</h2>
      <p className="mb-4 text-sm text-slate-500">
        Kebiasaan mencatat transaksi harian secara rutin — dihitung dari data transaksi Anda
      </p>

      <div className={`mb-4 rounded-md px-4 py-3 text-sm font-medium ${NOTIFICATION_STYLE[notification.tone]}`}>
        {notification.message}
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-500">Progres saat ini</span>
        {isCompleted ? (
          // Tercapai (>=30 hari): badge selebrasi + total streak sebagai info,
          // BUKAN pecahan "X/30" — currentStreak bisa jauh melebihi 30 (mis.
          // 109), jadi format pecahan akan menyesatkan (>100%).
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5 fill-emerald-600">
              <path d="M4.8 8.4 2.4 6l-.9.9 3.3 3.3 6-6-.9-.9z" />
            </svg>
            Tercapai · {data.currentStreak} hari
          </span>
        ) : (
          <span className="tabular-nums text-sm font-semibold text-slate-700">
            {data.currentStreak} / {CHALLENGE_TARGET_DAYS} hari
          </span>
        )}
      </div>

      {/* Grid 30 kotak: kotak terisi = hari berturut-turut tercatat (dibatasi 30
          — grid ini representasi progres MENUJU target 30, bukan hitungan total,
          jadi tetap sengaja penuh/dibatasi 30 saat sudah tercapai). */}
      <div
        className="mt-2 grid grid-cols-10 gap-1.5"
        role="img"
        aria-label={
          isCompleted
            ? `Tantangan 30 hari tercapai — total ${data.currentStreak} hari berturut-turut`
            : `${data.currentStreak} dari ${CHALLENGE_TARGET_DAYS} hari tercapai`
        }
      >
        {Array.from({ length: CHALLENGE_TARGET_DAYS }, (_, i) => (
          <div
            key={i}
            className={`h-5 w-full rounded ${i < filledBoxes ? 'bg-emerald-500' : 'border border-slate-200 bg-slate-50'}`}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span>
          Rekor terpanjang: <strong className="tabular-nums text-slate-700">{data.longestStreak} hari</strong>
        </span>
        <span>
          Pencatatan terakhir:{' '}
          <strong className="text-slate-700">{data.lastActivityDate ? formatDateID(data.lastActivityDate) : '-'}</strong>
        </span>
      </div>
    </section>
  )
}
