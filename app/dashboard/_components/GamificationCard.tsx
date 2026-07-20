import { formatDateID } from '@/lib/format'
import { buildStreakNotification, CHALLENGE_TARGET_DAYS } from '@/lib/gamification/streakCalculator'
import type { GamificationProgress } from '@/lib/gamification/gamificationService'

const NOTIFICATION_STYLE = {
  reset: 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-100',
  progress: 'bg-blue-50 text-blue-900 ring-1 ring-inset ring-blue-100',
  completed: 'bg-emerald-50 text-emerald-800 ring-1 ring-inset ring-emerald-100',
} as const

const CheckIcon = () => (
  <svg viewBox="0 0 14 14" aria-hidden="true" className="h-3.5 w-3.5 fill-current">
    <path d="M5.6 9.8 2.8 7l-1 1 3.8 3.8 7-7-1-1z" />
  </svg>
)

/**
 * Kartu Tantangan 30 Hari sebagai "kartu stempel warung" — metafora loyalty
 * card yang akrab bagi UMKM. Tiap hari tercatat = satu stempel emerald; hari
 * kosong = lingkaran bernomor. Tantangan selesai = cap "30 HARI TERCAPAI"
 * mendarat di atas kartu.
 *
 * Reuse murni streakCalculator (buildStreakNotification, CHALLENGE_TARGET_DAYS)
 * — tidak ada logic streak baru di sini.
 */
export function GamificationCard({ data }: { data: GamificationProgress | null }) {
  if (!data) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800">Tantangan 30 Hari</h2>
        <p className="mt-2 text-sm italic text-slate-400">
          Streak belum pernah dihitung. Selesaikan alur consent atau klik Refresh untuk menghitung yang pertama.
        </p>
      </section>
    )
  }

  const notification = buildStreakNotification(data)
  const isCompleted = notification.tone === 'completed'
  const filledBoxes = Math.min(data.currentStreak, CHALLENGE_TARGET_DAYS)

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Kepala kartu — pita navy tipis ala kop kartu stempel */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-blue-950 px-6 py-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-300">Rapor Sehat</p>
          <h2 className="text-lg font-semibold text-white">Tantangan 30 Hari</h2>
        </div>
        <div className="text-right">
          <p className="font-mono text-2xl font-bold leading-none tabular-nums text-white">
            {data.currentStreak}
            <span className="text-sm font-normal text-blue-300">/{CHALLENGE_TARGET_DAYS}</span>
          </p>
          <p className="mt-0.5 text-[11px] text-blue-300">hari beruntun</p>
        </div>
      </div>

      <div className="p-6">
        <p className="mb-4 text-sm text-slate-500">Kebiasaan mencatat transaksi harian secara rutin, dihitung dari data transaksi Anda.</p>

        <div className={`mb-5 rounded-lg px-4 py-3 text-sm font-medium ${NOTIFICATION_STYLE[notification.tone]}`}>
          {notification.message}
        </div>

        {/* Kartu stempel: 30 sel. Latar bertitik halus meniru kertas kartu. */}
        <div
          className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-4"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.18) 1px, transparent 1px)', backgroundSize: '11px 11px' }}
        >
          <div
            className="grid grid-cols-10 gap-2"
            role="img"
            aria-label={
              isCompleted
                ? `Tantangan 30 hari tercapai, total ${data.currentStreak} hari berturut-turut`
                : `${data.currentStreak} dari ${CHALLENGE_TARGET_DAYS} hari tercapai`
            }
          >
            {Array.from({ length: CHALLENGE_TARGET_DAYS }, (_, i) => {
              const filled = i < filledBoxes
              return (
                <div
                  key={i}
                  className={`stamp-cell flex aspect-square items-center justify-center rounded-full text-[10px] font-semibold ${
                    filled
                      ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/25'
                      : 'border-2 border-dashed border-slate-300 font-mono text-slate-300'
                  }`}
                  style={{ animationDelay: `${Math.min(i * 22, 660)}ms` }}
                >
                  {filled ? <CheckIcon /> : i + 1}
                </div>
              )
            })}
          </div>

          {/* Cap "TERCAPAI" mendarat saat tantangan selesai */}
          {isCompleted && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="stamp-seal flex flex-col items-center rounded-lg border-[3px] border-emerald-600/80 bg-white/85 px-4 py-2 text-center shadow-md backdrop-blur-[1px]">
                <span className="flex items-center gap-1 text-sm font-extrabold uppercase tracking-wider text-emerald-700">
                  <CheckIcon /> Tercapai
                </span>
                <span className="font-mono text-[11px] font-semibold text-emerald-700/80">{data.currentStreak} hari beruntun</span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500 sm:grid-cols-3">
          <span>
            Rekor terpanjang:{' '}
            <strong className="font-mono tabular-nums text-slate-700">{data.longestStreak} hari</strong>
          </span>
          <span>
            Pencatatan terakhir:{' '}
            <strong className="text-slate-700">{data.lastActivityDate ? formatDateID(data.lastActivityDate) : '-'}</strong>
          </span>
          <span>
            Dihitung: <strong className="text-slate-700">{formatDateID(data.updatedAt)}</strong>
          </span>
        </div>
      </div>
    </section>
  )
}
