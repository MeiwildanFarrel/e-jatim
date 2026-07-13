// Alternative Credit Scoring (ACS) — kalkulasi murni (tidak ada I/O di sini,
// data diambil oleh creditScoreService.ts). Semua logic angka = deterministik
// TypeScript, bukan AI/LLM (lihat CLAUDE.md §5).
//
// Status (13 Juli, keputusan tim 12-13 Juli): model ML Anggota B TIDAK dipakai
// untuk skor runtime Bu Sari — model itu dilatih di dataset publik (Kaggle Home
// Credit/LendingClub) dengan fitur yang tidak ada padanannya di data ledger
// UMKM kita. Growth/Stability/Risk di bawah dihitung dari ledger REAL Bu Sari;
// Reputation masih placeholder sampai modul NLP Anggota B (sentimen ulasan
// marketplace) selesai. Bobot w1-w4 di bawah TENTATIF (belum ada rujukan pasti
// dari Anggota B) — akan diganti begitu ada hasil benchmarking (AUC/F1/Gini/SHAP,
// lihat TASK.md backlog ACS).

export interface MonthlyRevenue {
  periodMonth: string // format 'YYYY-MM-01', sama seperti kolom ledger_entries.period_month
  revenue: number
  expense: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

// Bobot kombinasi (sum magnitude = 1.0). Tentatif — lihat catatan di atas.
// - Growth (0.35): sinyal paling langsung dari trajektori usaha; sudah jadi
//   klaim utama di PRD (+18% dst), jadi diberi bobot terbesar.
// - Stability (0.25): arus kas yang konsisten = risiko gagal bayar KUR lebih
//   rendah, meski trennya sedang naik.
// - Reputation (0.20): masih placeholder (lihat REPUTATION_PLACEHOLDER di
//   bawah), jadi sengaja tidak diberi bobot dominan.
// - Risk (0.20): proxy kasar (rasio beban/pendapatan), bukan model risiko
//   tervalidasi — dibatasi 0.20 sampai ada model ML Anggota B yang teruji.
export const ACS_WEIGHTS = {
  growth: 0.35,
  stability: 0.25,
  reputation: 0.2,
  risk: 0.2,
}

// Reputation belum punya sumber data nyata untuk Bu Sari (15-20 UMKM riil F4
// terpisah dari skenario demo Bu Sari, lihat PRD.md §5). Nilai 50 = netral
// tengah, BUKAN hasil analisis NLP — placeholder murni. Hanya diikutkan dalam
// formula kalau UMKM sudah menyetujui Toggle B (marketplace_review_access),
// lihat computeAcsScore().
export const REPUTATION_PLACEHOLDER = 50

/**
 * Growth: bandingkan pendapatan bulan pertama vs bulan terakhir yang SUDAH
 * lengkap (bulan berjalan yang belum selesai sengaja dikeluarkan dari
 * komponen ini oleh caller — lihat creditScoreService.ts — supaya bulan
 * parsial tidak bikin growth kelihatan turun palsu).
 *
 * growthPct = (bulanTerakhir - bulanPertama) / bulanPertama * 100
 * growthScore = clamp(50 + growthPct, 0, 100)
 *   → 0% growth memetakan ke titik tengah netral (50), tiap 1 poin persentase
 *     growth/penurunan menggeser skor 1 poin, dibatasi 0-100.
 */
export function computeGrowthScore(months: MonthlyRevenue[]): { growthPct: number; growthScore: number } {
  if (months.length < 2) return { growthPct: 0, growthScore: 50 }

  const first = months[0].revenue
  const last = months[months.length - 1].revenue
  if (first <= 0) return { growthPct: 0, growthScore: 50 }

  const growthPct = ((last - first) / first) * 100
  return { growthPct, growthScore: clamp(50 + growthPct, 0, 100) }
}

/**
 * Stability: koefisien variasi (CV) pendapatan antar bulan yang lengkap.
 * CV = stdev(populasi) / mean. Semakin kecil variasi relatif, semakin stabil.
 *
 * stabilityScore = clamp(100 - CV*100, 0, 100)
 *   → CV 0% (pendapatan identik tiap bulan) = 100 (paling stabil), makin
 *     besar variasi relatif makin rendah skornya, dibatasi di 0.
 */
export function computeStabilityScore(months: MonthlyRevenue[]): { coefficientOfVariation: number; stabilityScore: number } {
  if (months.length < 2) return { coefficientOfVariation: 0, stabilityScore: 50 }

  const revenues = months.map((m) => m.revenue)
  const mean = revenues.reduce((sum, v) => sum + v, 0) / revenues.length
  if (mean <= 0) return { coefficientOfVariation: 0, stabilityScore: 50 }

  const variance = revenues.reduce((sum, v) => sum + (v - mean) ** 2, 0) / revenues.length
  const stdev = Math.sqrt(variance)
  const coefficientOfVariation = stdev / mean

  return { coefficientOfVariation, stabilityScore: clamp(100 - coefficientOfVariation * 100, 0, 100) }
}

/**
 * Risk: proxy sederhana dari rasio total beban terhadap total pendapatan
 * (bulan-bulan lengkap yang sama dengan Growth/Stability). Penjelasan: usaha
 * yang menghabiskan porsi besar pendapatannya untuk beban operasional punya
 * margin lebih tipis dan bantalan kas lebih kecil untuk mengangsur kredit —
 * jadi diperlakukan sebagai risiko lebih tinggi. Ini proxy KASAR (bukan model
 * risiko yang divalidasi statistik), dan RiskFactor DIKURANGKAN dari skor
 * akhir (Score = ... - w4·RiskFactor, lihat PRD.md §F3).
 *
 * riskScore = clamp(totalExpense / totalRevenue * 100, 0, 100)
 */
export function computeRiskScore(months: MonthlyRevenue[]): { expenseRatio: number; riskScore: number } {
  const totalRevenue = months.reduce((sum, m) => sum + m.revenue, 0)
  const totalExpense = months.reduce((sum, m) => sum + m.expense, 0)
  if (totalRevenue <= 0) return { expenseRatio: 0, riskScore: 0 }

  const expenseRatio = totalExpense / totalRevenue
  return { expenseRatio, riskScore: clamp(expenseRatio * 100, 0, 100) }
}

export interface AcsBreakdown {
  growthScore: number
  stabilityScore: number
  reputationScore: number | null // null = Toggle B belum disetujui, komponen dikeluarkan dari formula
  riskScore: number
  finalScore: number
  scoreCategory: 'Hijau' | 'Kuning' | 'Merah'
  weightsUsed: { growth: number; stability: number; reputation: number; risk: number }
}

// Threshold band skor — satu sumber kebenaran dipakai baik oleh
// scoreCategoryOf() di sini maupun gauge visual di dashboard
// (SpeedometerCard.tsx), supaya warna & kategori tidak pernah berbeda.
export const SCORE_THRESHOLDS = { hijau: 70, kuning: 40 }

export function scoreCategoryOf(score: number): 'Hijau' | 'Kuning' | 'Merah' {
  if (score >= SCORE_THRESHOLDS.hijau) return 'Hijau'
  if (score >= SCORE_THRESHOLDS.kuning) return 'Kuning'
  return 'Merah'
}

/**
 * Gabungkan 4 komponen jadi satu skor 0-100.
 *
 * Score = w1·Growth + w2·Stability + w3·Reputation − w4·RiskFactor
 *
 * Kalau Reputation belum disetujui user (reputationScore = null, Toggle B
 * belum granted), komponen itu DIKELUARKAN sepenuhnya — bukan diisi 0 (yang
 * akan menghukum user karena memilih privasi) dan bukan dianggap 50 diam-diam
 * (yang membuat "aktif hanya jika Toggle B disetujui" jadi tidak berarti).
 * Bobot w3 didistribusikan ulang secara proporsional ke w1/w2/w4 supaya skala
 * skor tetap sebanding (0-100) baik Reputation ada maupun tidak.
 */
export function combineAcsScore(input: {
  growthScore: number
  stabilityScore: number
  reputationScore: number | null
  riskScore: number
}): AcsBreakdown {
  const { growthScore, stabilityScore, reputationScore, riskScore } = input

  let weights = { ...ACS_WEIGHTS }
  if (reputationScore === null) {
    const remaining = 1 - ACS_WEIGHTS.reputation // 0.8
    weights = {
      growth: ACS_WEIGHTS.growth / remaining,
      stability: ACS_WEIGHTS.stability / remaining,
      reputation: 0,
      risk: ACS_WEIGHTS.risk / remaining,
    }
  }

  const raw =
    weights.growth * growthScore +
    weights.stability * stabilityScore +
    weights.reputation * (reputationScore ?? 0) -
    weights.risk * riskScore

  const finalScore = clamp(Math.round(raw), 0, 100)

  return {
    growthScore: Math.round(growthScore * 10) / 10,
    stabilityScore: Math.round(stabilityScore * 10) / 10,
    reputationScore,
    riskScore: Math.round(riskScore * 10) / 10,
    finalScore,
    scoreCategory: scoreCategoryOf(finalScore),
    weightsUsed: weights,
  }
}
