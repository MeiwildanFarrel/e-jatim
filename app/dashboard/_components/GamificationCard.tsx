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
        <span className="tabular-nums text-sm font-semibold text-slate-700">
          {data.currentStreak} / {CHALLENGE_TARGET_DAYS} hari
        </span>
      </div>

      {/* Grid 30 kotak: kotak terisi = hari berturut-turut tercatat (dibatasi 30) */}
      <div className="mt-2 grid grid-cols-10 gap-1.5" role="img" aria-label={`${data.currentStreak} dari ${CHALLENGE_TARGET_DAYS} hari tercapai`}>
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
