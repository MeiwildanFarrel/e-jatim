import { formatDateID } from '@/lib/format'
import { SCORE_THRESHOLDS } from '@/lib/scoring/acsCalculator'
import type { CreditScoreRow } from '@/lib/scoring/getCreditScore'

const CATEGORY_STYLE = {
  Hijau: { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Kuning: { text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Merah: { text: 'text-red-600', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500' },
} as const

const CENTER = { x: 110, y: 110 }
const RADIUS = 88
const STROKE = 22

// angle: 180deg = kiri (skor 0), 0deg = kanan (skor 100), melewati atas.
function angleForScore(score: number): number {
  return 180 - (score / 100) * 180
}

function pointAt(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER.x + RADIUS * Math.cos(rad), y: CENTER.y - RADIUS * Math.sin(rad) }
}

function bandArcPath(fromAngle: number, toAngle: number): string {
  const start = pointAt(fromAngle)
  const end = pointAt(toAngle)
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 0 1 ${end.x} ${end.y}`
}

// Batas antar-pita mengikuti SCORE_THRESHOLDS (sama persis dgn scoreCategoryOf
// di acsCalculator.ts) supaya warna gauge tidak pernah berbeda dari kategori
// yang tersimpan di credit_scores.score_category.
const bands = [
  { from: 180, to: angleForScore(SCORE_THRESHOLDS.kuning), color: '#ef4444' }, // Merah: 0-40
  { from: angleForScore(SCORE_THRESHOLDS.kuning), to: angleForScore(SCORE_THRESHOLDS.hijau), color: '#f59e0b' }, // Kuning: 40-70
  { from: angleForScore(SCORE_THRESHOLDS.hijau), to: 0, color: '#10b981' }, // Hijau: 70-100
]

function ComponentRow({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="tabular-nums font-medium text-slate-700">
        {value}
        {note && <span className="ml-1.5 text-xs font-normal text-slate-400">{note}</span>}
      </span>
    </div>
  )
}

export function SpeedometerCard({ data }: { data: CreditScoreRow | null }) {
  if (!data) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-800">Rapor Sehat Keuangan</h2>
        <p className="mt-2 text-sm italic text-slate-400">
          Skor belum tersedia. Berikan izin akses di layar consent untuk menghitung skor pertama Anda.
        </p>
      </section>
    )
  }

  const style = CATEGORY_STYLE[data.score_category]
  const needleAngle = angleForScore(data.score)
  const needleTip = pointAt(needleAngle)

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Rapor Sehat Keuangan</h2>
      <p className="mb-4 text-sm text-slate-500">Skor kredit alternatif (ACS) dari data ledger Anda</p>

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
        <div className="mx-auto w-full max-w-[220px]">
          <svg viewBox="0 0 220 130" className="w-full" role="img" aria-label={`Skor ${data.score} dari 100, kategori ${data.score_category}`}>
            {bands.map((b) => (
              <path key={b.color} d={bandArcPath(b.from, b.to)} stroke={b.color} strokeWidth={STROKE} fill="none" strokeLinecap="butt" />
            ))}
            <line
              x1={CENTER.x}
              y1={CENTER.y}
              x2={needleTip.x}
              y2={needleTip.y}
              stroke="#1e3a8a"
              strokeWidth={3}
              strokeLinecap="round"
            />
            <circle cx={CENTER.x} cy={CENTER.y} r={6} fill="#1e3a8a" />
          </svg>
          <div className="-mt-6 text-center">
            <p className={`text-3xl font-bold tabular-nums ${style.text}`}>{data.score}</p>
            <p className="text-xs text-slate-400">dari 100</p>
          </div>
        </div>

        <div className="w-full">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${style.badge}`}>
            <span className={`h-2 w-2 rounded-full ${style.dot}`} />
            {data.score_category}
          </span>

          <div className="mt-3 divide-y divide-slate-100">
            <ComponentRow label="Pertumbuhan (Growth)" value={data.growth_score.toString()} />
            <ComponentRow label="Kestabilan (Stability)" value={data.stability_score.toString()} />
            <ComponentRow
              label="Reputasi"
              value={data.reputation_score === null ? 'Belum aktif' : data.reputation_score.toString()}
              note={data.reputation_score === null ? '(izin belum diberikan)' : '(placeholder)'}
            />
            <ComponentRow label="Faktor Risiko" value={data.risk_factor_score.toString()} note="(dikurangkan)" />
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Dihitung {formatDateID(data.calculated_at)} · model {data.model_version}
          </p>
        </div>
      </div>

      <p className="mt-5 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">
        Skor ini dihasilkan oleh model penilaian internal untuk keperluan simulasi dan riset akademik. Skor ini bukan
        hasil pemeringkatan dari Pemeringkat Kredit Alternatif berizin OJK, dan bukan merupakan keputusan pemberian
        kredit. Keputusan kredit sepenuhnya berada pada lembaga jasa keuangan.
      </p>
    </section>
  )
}
