/**
 * Seed ~3 bulan transaksi harian untuk UMKM "Bu Sari" (Nasi Campur Bu Sari).
 * Dijalankan sekali secara manual: npx tsx scripts/seed-bu-sari-3-months.ts
 *
 * Hanya INSERT ke tabel `transactions` (classification_status = 'pending').
 * Klasifikasi ke ledger_entries dilakukan lewat endpoint /api/classify yang
 * sudah ada — dijalankan terpisah setelah script ini selesai (lihat laporan).
 *
 * Rentang: 1 April - 29 Juni 2026 (mendahului 13 transaksi lama yang sudah
 * ada, yang mulai dari 30 Juni 2026 — supaya tidak tumpang tindih tanggal).
 *
 * Target pertumbuhan pendapatan (akun 400/401): April -> Juni = +18% total,
 * TIDAK linear (Mei sengaja bukan tepat di tengah, plus noise harian +
 * "hari sepi" acak ~12% dari hari).
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local')
  const content = readFileSync(envPath, 'utf8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const UMKM_ID = '71d869df-7a97-4d29-af8c-40bc55f895bf' // Nasi Campur Bu Sari

interface TransactionRow {
  umkm_id: string
  source: string
  amount: number
  transaction_type: 'in' | 'out'
  raw_description: string
  transaction_date: string
  classification_status: 'pending'
}

function randRange(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

function randInt(min: number, max: number): number {
  return Math.floor(randRange(min, max + 1))
}

function roundToThousand(n: number): number {
  return Math.round(n / 1000) * 1000
}

function pickRandom<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)]
}

// ---------------------------------------------------------------------------
// Deskripsi transaksi — dipilih supaya cocok persis dengan pola regex Tier 1
// di src/lib/classifier/regexRules.ts (biar semua ke-classify, bukan cuma
// dummy label yang tidak akan pernah kena Tier 1).
// ---------------------------------------------------------------------------

const REVENUE_ITEMS: { desc: string; source: string }[] = [
  { desc: 'Pembayaran QRIS - Penjualan harian', source: 'qris' },
  { desc: 'Penjualan nasi campur siang', source: 'qris' },
  { desc: 'Penjualan nasi campur sore', source: 'cash' },
  { desc: 'Orderan GoFood siang', source: 'gofood' },
  { desc: 'Orderan ShopeeFood makan siang', source: 'shopeefood' },
  { desc: 'Pesanan online catering', source: 'tokopedia' },
  { desc: 'Pesanan online untuk acara kantor', source: 'tokopedia' },
]

const EXPENSE_POOL: {
  desc: string
  category: 'bahan_baku' | 'utilitas' | 'gaji' | 'sewa' | 'kemasan_transport'
  min: number
  max: number
}[] = [
  { desc: 'Beli bahan baku sayur dan daging', category: 'bahan_baku', min: 180_000, max: 420_000 },
  { desc: 'Beli sayur dan bumbu dapur pasar pagi', category: 'bahan_baku', min: 120_000, max: 300_000 },
  { desc: 'Belanja bahan baku ayam dan telur', category: 'bahan_baku', min: 150_000, max: 380_000 },
  { desc: 'Kulakan beras dan minyak goreng', category: 'bahan_baku', min: 200_000, max: 450_000 },
  { desc: 'Beli gas LPG', category: 'utilitas', min: 150_000, max: 220_000 },
  { desc: 'Bayar token listrik bulanan', category: 'utilitas', min: 120_000, max: 280_000 },
  { desc: 'Bayar tagihan air PDAM', category: 'utilitas', min: 60_000, max: 150_000 },
  { desc: 'Setor gaji karyawan harian', category: 'gaji', min: 250_000, max: 400_000 },
  { desc: 'Bayar sewa kios bulanan', category: 'sewa', min: 900_000, max: 1_500_000 },
  { desc: 'Beli plastik dan kemasan makan', category: 'kemasan_transport', min: 60_000, max: 180_000 },
  { desc: 'Ongkir bahan baku dari pasar', category: 'kemasan_transport', min: 30_000, max: 90_000 },
]

const MODAL_DESC = 'Setor modal usaha tambahan'
const MODAL_SOURCE = 'qris'

// ---------------------------------------------------------------------------
// Rencana bulanan — target TOTAL pendapatan per bulan (akun 400/401).
// April -> Juni = +18% persis (103_680_000 di Mei sengaja bukan titik tengah
// linear supaya trennya tidak lurus sempurna).
// Juni cuma sampai tanggal 29 supaya tidak tabrakan dengan transaksi lama
// yang sudah mulai 30 Juni 2026.
// ---------------------------------------------------------------------------

const MONTHS = [
  { label: 'April 2026', year: 2026, month: 3, days: 30, revenueTarget: 96_000_000 },
  { label: 'Mei 2026', year: 2026, month: 4, days: 31, revenueTarget: 103_680_000 },
  { label: 'Juni 2026 (s.d. tgl 29)', year: 2026, month: 5, days: 29, revenueTarget: 113_280_000 },
] as const

interface DayPlan {
  year: number
  month: number // 0-based, sesuai Date.UTC
  day: number
  monthIndex: number
  globalDayIndex: number
  isLowDay: boolean
  revenueWeight: number
}

function buildDayPlans(): DayPlan[] {
  const plans: DayPlan[] = []
  let globalDayIndex = 0
  MONTHS.forEach((m, monthIndex) => {
    for (let d = 1; d <= m.days; d++) {
      const isLowDay = Math.random() < 0.12
      const noise = randRange(0.85, 1.15)
      const revenueWeight = isLowDay ? noise * randRange(0.35, 0.55) : noise
      plans.push({
        year: m.year,
        month: m.month,
        day: d,
        monthIndex,
        globalDayIndex,
        isLowDay,
        revenueWeight,
      })
      globalDayIndex++
    }
  })
  return plans
}

function assignDailyRevenueTargets(plans: DayPlan[]): Map<DayPlan, number> {
  const targets = new Map<DayPlan, number>()
  MONTHS.forEach((m, monthIndex) => {
    const days = plans.filter((p) => p.monthIndex === monthIndex)
    const totalWeight = days.reduce((s, p) => s + p.revenueWeight, 0)
    for (const day of days) {
      targets.set(day, (day.revenueWeight / totalWeight) * m.revenueTarget)
    }
  })
  return targets
}

function isoAt(year: number, month: number, day: number, hourUtc: number): string {
  const minute = randInt(0, 59)
  const second = randInt(0, 59)
  return new Date(Date.UTC(year, month, day, hourUtc, minute, second)).toISOString()
}

function generateDayTransactions(day: DayPlan, revenueTarget: number): TransactionRow[] {
  const rows: TransactionRow[] = []

  // --- Beban (expense) dulu, supaya jumlah transaksi pendapatan bisa
  //     disesuaikan agar total transaksi harian tetap masuk rentang 5-15. ---
  const expenseEntries: { desc: string; source: string; amount: number; hourUtc: number }[] = []

  const bahanBakuChance = day.isLowDay ? 0.45 : 0.78
  if (Math.random() < bahanBakuChance) {
    const item = pickRandom(EXPENSE_POOL.filter((e) => e.category === 'bahan_baku'))
    expenseEntries.push({
      desc: item.desc,
      source: 'gopay',
      amount: roundToThousand(randRange(item.min, item.max)),
      hourUtc: randInt(0, 2), // pagi WIB ~07:00-09:00
    })
  }

  if (Math.random() < 0.2) {
    const item = pickRandom(EXPENSE_POOL.filter((e) => e.category === 'utilitas'))
    expenseEntries.push({
      desc: item.desc,
      source: 'gopay',
      amount: roundToThousand(randRange(item.min, item.max)),
      hourUtc: randInt(2, 8),
    })
  }

  if (Math.random() < 0.12) {
    const item = pickRandom(EXPENSE_POOL.filter((e) => e.category === 'kemasan_transport'))
    expenseEntries.push({
      desc: item.desc,
      source: 'gopay',
      amount: roundToThousand(randRange(item.min, item.max)),
      hourUtc: randInt(3, 10),
    })
  }

  // Gaji: kira-kira mingguan.
  if (day.globalDayIndex % 7 === 6) {
    const item = EXPENSE_POOL.find((e) => e.category === 'gaji')!
    expenseEntries.push({
      desc: item.desc,
      source: 'gopay',
      amount: roundToThousand(randRange(item.min, item.max)),
      hourUtc: randInt(9, 13),
    })
  }

  // Sewa: sekali per bulan (tanggal 3).
  if (day.day === 3) {
    const item = EXPENSE_POOL.find((e) => e.category === 'sewa')!
    expenseEntries.push({
      desc: item.desc,
      source: 'gopay',
      amount: roundToThousand(randRange(item.min, item.max)),
      hourUtc: randInt(3, 6),
    })
  }

  // Modal: sekali per bulan (tanggal 15) — "sesekali setoran modal".
  if (day.day === 15) {
    expenseEntries.push({
      desc: MODAL_DESC,
      source: MODAL_SOURCE,
      amount: roundToThousand(randRange(1_500_000, 3_000_000)),
      hourUtc: randInt(2, 7),
    })
  }

  for (const e of expenseEntries) {
    rows.push({
      umkm_id: UMKM_ID,
      source: e.source,
      amount: e.amount,
      transaction_type: e.desc === MODAL_DESC ? 'in' : 'out',
      raw_description: e.desc,
      transaction_date: isoAt(day.year, day.month, day.day, e.hourUtc),
      classification_status: 'pending',
    })
  }

  // --- Pendapatan: jumlah transaksi disesuaikan supaya total harian ---
  //     tetap masuk rentang ~5-15 (jangan seragam).
  const targetTotalPerDay = day.isLowDay ? randInt(5, 8) : randInt(7, 15)
  const minRevenueCount = day.isLowDay ? 2 : 3
  const revenueCount = Math.max(targetTotalPerDay - expenseEntries.length, minRevenueCount)

  const weights = Array.from({ length: revenueCount }, () => randRange(0.5, 1.5))
  const totalWeight = weights.reduce((s, w) => s + w, 0)

  for (let i = 0; i < revenueCount; i++) {
    const item = pickRandom(REVENUE_ITEMS)
    const amount = roundToThousand((weights[i] / totalWeight) * revenueTarget)
    // Jam sibuk: makan siang (WIB 11-13 = UTC 4-6) & makan malam (WIB 17-20 = UTC 10-13)
    const hourUtc = Math.random() < 0.5 ? randInt(0, 6) : randInt(7, 13)
    rows.push({
      umkm_id: UMKM_ID,
      source: item.source,
      amount,
      transaction_type: 'in',
      raw_description: item.desc,
      transaction_date: isoAt(day.year, day.month, day.day, hourUtc),
      classification_status: 'pending',
    })
  }

  return rows
}

async function main(): Promise<void> {
  const plans = buildDayPlans()
  const dailyRevenueTargets = assignDailyRevenueTargets(plans)

  const allRows: TransactionRow[] = []
  const perDayCounts: number[] = []

  for (const day of plans) {
    const target = dailyRevenueTargets.get(day)!
    const dayRows = generateDayTransactions(day, target)
    perDayCounts.push(dayRows.length)
    allRows.push(...dayRows)
  }

  console.log(`Total hari: ${plans.length}`)
  console.log(`Total transaksi digenerate: ${allRows.length}`)
  console.log(`Transaksi/hari — min: ${Math.min(...perDayCounts)}, max: ${Math.max(...perDayCounts)}, avg: ${(allRows.length / plans.length).toFixed(1)}`)

  // Ringkasan target pendapatan per bulan (buat sanity check sebelum insert)
  MONTHS.forEach((m) => {
    console.log(`Target pendapatan ${m.label}: Rp${m.revenueTarget.toLocaleString('id-ID')}`)
  })
  const growthPct = ((MONTHS[2].revenueTarget - MONTHS[0].revenueTarget) / MONTHS[0].revenueTarget) * 100
  console.log(`Target growth April -> Juni: +${growthPct.toFixed(1)}%`)

  const BATCH_SIZE = 200
  for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
    const batch = allRows.slice(i, i + BATCH_SIZE)
    const { error } = await supabaseAdmin.from('transactions').insert(batch)
    if (error) {
      console.error(`Insert gagal pada batch mulai index ${i}:`, error.message)
      process.exit(1)
    }
    console.log(`Insert batch ${i}-${i + batch.length} OK`)
  }

  console.log('Seeding selesai. Semua baris berstatus classification_status = pending.')
}

main().catch((err) => {
  console.error('Seeding gagal:', err)
  process.exit(1)
})
