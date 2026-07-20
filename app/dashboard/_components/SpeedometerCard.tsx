import { formatDateID } from '@/lib/format'
import { SCORE_THRESHOLDS } from '@/lib/scoring/acsCalculator'
import type { CreditScoreRow } from '@/lib/scoring/getCreditScore'

const CATEGORY_STYLE = {
  Hijau: { text: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500', label: 'Sehat, layak kredit' },
  Kuning: { text: 'text-amber-600', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500', label: 'Perlu perhatian' },
  Merah: { text: 'text-red-600', badge: 'bg-red-50 text-red-700', dot: 'bg-red-500', label: 'Berisiko' },
} as const

const CENTER = { x: 110, y: 110 }
const TRACK_R = 88

// angle: 180deg = kiri (skor 0), 0deg = kanan (skor 100), melewati atas.
function angleForScore(score: number): number {
  return 180 - (score / 100) * 180
}

function pointAtR(angleDeg: number, r: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180
  return { x: CENTER.x + r * Math.cos(rad), y: CENTER.y - r * Math.sin(rad) }
}

function bandArcPath(fromAngle: number, toAngle: number, r: number): string {
  const start = pointAtR(fromAngle, r)
  const end = pointAtR(toAngle, r)
  return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
}

// Batas antar-pita mengikuti SCORE_THRESHOLDS (sama persis dgn scoreCategoryOf
// di acsCalculator.ts) supaya warna gauge tidak pernah berbeda dari kategori.
const BANDS = [
  { key: 'Merah', from: 180, to: angleForScore(SCORE_THRESHOLDS.kuning), color: '#ef4444' },
  { key: 'Kuning', from: angleForScore(SCORE_THRESHOLDS.kuning), to: angleForScore(SCORE_THRESHOLDS.hijau), color: '#f59e0b' },
  { key: 'Hijau', from: angleForScore(SCORE_THRESHOLDS.hijau), to: 0, color: '#10b981' },
] as const

function tickMark(score: number, r1: number, r2: number) {
  const a = angleForScore(score)
  const p1 = pointAtR(a, r1)
  const p2 = pointAtR(a, r2)
  return { p1, p2 }
}

function Gauge({ score, category, hero }: { score: number; category: 'Hijau' | 'Kuning' | 'Merah'; hero: boolean }) {
  const needleAngle = angleForScore(score)
  const tip = pointAtR(needleAngle, TRACK_R - 16)
  const perp = needleAngle + 90
  const base1 = pointAtR(perp, 5.5)
  const base2 = pointAtR(perp + 180, 5.5)
  const needlePoly = `${base1.x},${base1.y} ${tip.x},${tip.y} ${base2.x},${base2.y}`

  const trackColor = hero ? 'rgba(255,255,255,0.12)' : '#e2e8f0'
  const tickColor = hero ? 'rgba(255,255,255,0.9)' : '#ffffff'
  const labelColor = hero ? '#93c5fd' : '#94a3b8'
  const hubFill = hero ? '#ffffff' : '#1e3a8a'

  const activeKey = category

  return (
    <svg viewBox="0 0 220 124" className="w-full" role="img" aria-label={`Skor ${score} dari 100, kategori ${category}`}>
      {/* rail dasar */}
      <path d={bandArcPath(180, 0, TRACK_R)} stroke={trackColor} strokeWidth={22} fill="none" strokeLinecap="round" />
      {/* pita warna — zona aktif penuh, lainnya diredupkan (mengarahkan mata,
          warna tetap muncul semua supaya skala terbaca) */}
      {BANDS.map((b) => (
        <path
          key={b.key}
          d={bandArcPath(b.from, b.to, TRACK_R)}
          stroke={b.color}
          strokeWidth={16}
          fill="none"
          strokeLinecap="butt"
          opacity={b.key === activeKey ? 1 : 0.32}
        />
      ))}
      {/* tick di ambang 40 & 70 (batas warna sesungguhnya) */}
      {[SCORE_THRESHOLDS.kuning, SCORE_THRESHOLDS.hijau].map((s) => {
        const t = tickMark(s, TRACK_R - 8, TRACK_R + 8)
        return <line key={s} x1={t.p1.x} y1={t.p1.y} x2={t.p2.x} y2={t.p2.y} stroke={tickColor} strokeWidth={2} strokeLinecap="round" />
      })}
      {/* label skala 0 & 100 */}
      <text x={22} y={122} textAnchor="middle" fontSize={9} fill={labelColor} className="font-mono">0</text>
      <text x={198} y={122} textAnchor="middle" fontSize={9} fill={labelColor} className="font-mono">100</text>
      {/* jarum + dot ujung + hub, dibungkus g untuk animasi sweep */}
      <g className="gauge-needle">
        <polygon points={needlePoly} fill={hubFill} />
        <circle cx={CENTER.x} cy={CENTER.y} r={7} fill={hubFill} />
        <circle cx={CENTER.x} cy={CENTER.y} r={3} fill={hero ? '#1e3a8a' : '#ffffff'} />
        <circle cx={tip.x} cy={tip.y} r={4} fill={BANDS.find((b) => b.key === activeKey)?.color} stroke={hero ? '#0b1220' : '#ffffff'} strokeWidth={1.5} />
      </g>
    </svg>
  )
}

function ComponentRow({ label, value, note, hero }: { label: string; value: string; note?: string; hero?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className={hero ? 'text-blue-200' : 'text-slate-500'}>{label}</span>
      <span className={`font-mono tabular-nums text-sm font-medium ${hero ? 'text-white' : 'text-slate-700'}`}>
        {value}
        {note && <span className={`ml-1.5 text-xs font-normal ${hero ? 'text-blue-300' : 'text-slate-400'}`}>{note}</span>}
      </span>
    </div>
  )
}

const DISCLAIMER_TEXT =
  'Skor ini dihasilkan oleh model penilaian internal untuk keperluan simulasi dan riset akademik. Skor ini bukan hasil pemeringkatan dari Pemeringkat Kredit Alternatif berizin OJK, dan bukan merupakan keputusan pemberian kredit. Keputusan kredit sepenuhnya berada pada lembaga jasa keuangan.'

/**
 * @param variant 'hero' — dipakai SATU kali di tab Ringkasan sebagai elemen
 *   visual utama (kartu navy). 'compact' (default) — tab Skor Kredit & detail
 *   bank. Data/props (CreditScoreRow) sama persis di kedua varian — murni
 *   presentasi, bukan logic baru.
 */
export function SpeedometerCard({ data, variant = 'compact' }: { data: CreditScoreRow | null; variant?: 'hero' | 'compact' }) {
  const isHero = variant === 'hero'

  if (!data) {
    return (
      <section className={isHero ? 'rounded-2xl bg-blue-950 p-6 shadow-sm' : 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'}>
        <h2 className={`text-lg font-semibold ${isHero ? 'text-white' : 'text-slate-800'}`}>Rapor Sehat Keuangan</h2>
        <p className={`mt-2 text-sm italic ${isHero ? 'text-blue-200' : 'text-slate-400'}`}>
          Skor belum tersedia. Berikan izin akses di layar consent untuk menghitung skor pertama Anda.
        </p>
      </section>
    )
  }

  const style = CATEGORY_STYLE[data.score_category]

  return (
    <section
      className={
        isHero
          ? 'relative overflow-hidden rounded-2xl bg-blue-950 p-6 shadow-sm sm:p-8'
          : 'rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'
      }
    >
      {isHero && (
        <>
          <div aria-hidden="true" className="pointer-events-none absolute -top-16 right-[-8%] h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        </>
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={`text-lg font-semibold ${isHero ? 'text-white' : 'text-slate-800'}`}>Rapor Sehat Keuangan</h2>
            <p className={`text-sm ${isHero ? 'text-blue-200' : 'text-slate-500'}`}>Skor kredit alternatif (ACS) dari data ledger Anda</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
          <div className={`mx-auto w-full ${isHero ? 'max-w-[280px]' : 'max-w-[240px]'}`}>
            <Gauge score={data.score} category={data.score_category} hero={isHero} />
            {/* readout skor tepat di bawah gauge */}
            <div className="-mt-3 flex flex-col items-center">
              <p className={`gauge-score font-mono font-bold tabular-nums leading-none ${isHero ? 'text-5xl text-white' : `text-4xl ${style.text}`}`}>
                {data.score}
                <span className={`ml-1 text-base font-normal ${isHero ? 'text-blue-300' : 'text-slate-400'}`}>/100</span>
              </p>
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                {data.score_category}
              </span>
            </div>
          </div>

          <div className="w-full">
            <p className={`text-sm font-medium ${isHero ? 'text-blue-100' : 'text-slate-600'}`}>{style.label}</p>
            <div className={`mt-2 divide-y ${isHero ? 'divide-white/10' : 'divide-slate-100'}`}>
              <ComponentRow hero={isHero} label="Pertumbuhan (Growth)" value={data.growth_score.toString()} />
              <ComponentRow hero={isHero} label="Kestabilan (Stability)" value={data.stability_score.toString()} />
              <ComponentRow
                hero={isHero}
                label="Reputasi"
                value={data.reputation_score === null ? 'Belum aktif' : data.reputation_score.toString()}
                note={data.reputation_score === null ? '(izin belum diberikan)' : '(placeholder)'}
              />
              <ComponentRow hero={isHero} label="Faktor Risiko" value={data.risk_factor_score.toString()} note="(dikurangkan)" />
            </div>
            <p className={`mt-3 text-xs ${isHero ? 'text-blue-300' : 'text-slate-400'}`}>
              Dihitung {formatDateID(data.calculated_at)} · model {data.model_version}
            </p>
          </div>
        </div>

        <p className={`mt-5 rounded-md p-3 text-xs leading-relaxed ${isHero ? 'bg-white/10 text-blue-100' : 'bg-slate-50 text-slate-500'}`}>
          {DISCLAIMER_TEXT}
        </p>
      </div>
    </section>
  )
}
