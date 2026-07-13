import { supabaseAdmin } from '@/lib/supabase/server'
import {
  combineAcsScore,
  computeGrowthScore,
  computeStabilityScore,
  computeRiskScore,
  REPUTATION_PLACEHOLDER,
  type AcsBreakdown,
  type MonthlyRevenue,
} from './acsCalculator'

const PAGE_SIZE = 1000
const MODEL_VERSION = 'v0.5-ledger-partial'

interface LedgerRowForScoring {
  entry_side: 'debit' | 'credit'
  amount: number
  period_month: string
  chart_of_accounts: { account_type: string } | null
}

// Sama seperti toPeriodMonth() di app/api/classify/route.ts — format
// 'YYYY-MM-01', berbasis UTC, supaya cocok persis dengan cara period_month
// ditulis ke ledger_entries.
function toPeriodMonth(date: Date): string {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

/**
 * Ambil pendapatan & beban per bulan dari ledger_entries, HANYA untuk bulan
 * kalender yang sudah lengkap (bulan berjalan saat ini dikeluarkan). Kalau
 * bulan parsial diikutkan, Growth/Stability jadi bias: bulan berjalan yang
 * baru separuh jalan akan selalu terlihat "turun tajam" padahal itu cuma
 * efek jumlah hari, bukan penurunan bisnis sungguhan.
 */
async function fetchCompletedMonths(umkmId: string, referenceDate: Date): Promise<MonthlyRevenue[]> {
  const currentPeriodMonth = toPeriodMonth(referenceDate)

  const allRows: LedgerRowForScoring[] = []
  let from = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('ledger_entries')
      .select('entry_side, amount, period_month, chart_of_accounts(account_type)')
      .eq('umkm_id', umkmId)
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw new Error(error.message)

    const page = (data ?? []) as unknown as LedgerRowForScoring[]
    allRows.push(...page)
    if (page.length < PAGE_SIZE) break
    from += PAGE_SIZE
  }

  const byMonth = new Map<string, { revenue: number; expense: number }>()
  for (const row of allRows) {
    if (row.period_month >= currentPeriodMonth) continue // bulan berjalan/masa depan, dikeluarkan

    const bucket = byMonth.get(row.period_month) ?? { revenue: 0, expense: 0 }
    const accountType = row.chart_of_accounts?.account_type

    if (accountType === 'Revenue') {
      bucket.revenue += row.entry_side === 'credit' ? Number(row.amount) : -Number(row.amount)
    } else if (accountType === 'Expense') {
      bucket.expense += row.entry_side === 'debit' ? Number(row.amount) : -Number(row.amount)
    }

    byMonth.set(row.period_month, bucket)
  }

  return Array.from(byMonth.entries())
    .map(([periodMonth, v]) => ({ periodMonth, revenue: v.revenue, expense: v.expense }))
    .sort((a, b) => a.periodMonth.localeCompare(b.periodMonth))
}

/**
 * Reputation hanya diikutkan kalau UMKM sudah menyetujui Toggle B
 * (consent_type = 'marketplace_review_access', granted = true) di layar
 * consent (app/consent) — lihat combineAcsScore() untuk bagaimana
 * ketidakhadirannya ditangani di formula.
 */
async function hasReputationConsent(umkmId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('consent_records')
    .select('granted')
    .eq('umkm_id', umkmId)
    .eq('consent_type', 'marketplace_review_access')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw new Error(error.message)
  return data?.[0]?.granted === true
}

export interface CreditScoreResult {
  umkmId: string
  breakdown: AcsBreakdown
  completedMonths: MonthlyRevenue[]
  reputationConsentGranted: boolean
}

export async function computeCreditScore(umkmId: string, referenceDate: Date = new Date()): Promise<CreditScoreResult> {
  const completedMonths = await fetchCompletedMonths(umkmId, referenceDate)
  const reputationConsentGranted = await hasReputationConsent(umkmId)

  const { growthScore } = computeGrowthScore(completedMonths)
  const { stabilityScore } = computeStabilityScore(completedMonths)
  const { riskScore } = computeRiskScore(completedMonths)
  const reputationScore = reputationConsentGranted ? REPUTATION_PLACEHOLDER : null

  const breakdown = combineAcsScore({ growthScore, stabilityScore, reputationScore, riskScore })

  return { umkmId, breakdown, completedMonths, reputationConsentGranted }
}

/**
 * Hitung skor lalu simpan ke credit_scores, MENGGANTI baris lama (termasuk
 * baris dummy model_version='v0.1-dummy') dengan satu baris baru. credit_scores
 * berperilaku sebagai "skor terkini" per UMKM (bukan riwayat versi), dan
 * loan_applications.credit_score_id belum dipakai (tabel itu masih 0 baris
 * per PRD.md §4.1), jadi aman untuk delete+insert.
 */
export async function saveCreditScore(umkmId: string, referenceDate: Date = new Date()): Promise<CreditScoreResult> {
  const result = await computeCreditScore(umkmId, referenceDate)

  const { error: deleteError } = await supabaseAdmin.from('credit_scores').delete().eq('umkm_id', umkmId)
  if (deleteError) throw new Error(deleteError.message)

  const { error: insertError } = await supabaseAdmin.from('credit_scores').insert({
    umkm_id: umkmId,
    score: result.breakdown.finalScore,
    score_category: result.breakdown.scoreCategory,
    growth_score: result.breakdown.growthScore,
    stability_score: result.breakdown.stabilityScore,
    reputation_score: result.breakdown.reputationScore,
    risk_factor_score: result.breakdown.riskScore,
    calculated_at: new Date().toISOString(),
    model_version: MODEL_VERSION,
  })
  if (insertError) throw new Error(insertError.message)

  return result
}
