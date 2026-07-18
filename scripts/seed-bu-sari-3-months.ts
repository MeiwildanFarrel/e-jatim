/**
 * Seed ~3 bulan transaksi harian untuk UMKM "Bu Sari" (Nasi Campur Bu Sari).
 * Dijalankan manual, BOLEH DIULANG kapan saja: npx tsx scripts/seed-bu-sari-3-months.ts
 *
 * Hanya INSERT ke tabel `transactions` (classification_status = 'pending').
 * Klasifikasi ke ledger_entries dilakukan lewat endpoint /api/classify yang
 * sudah ada — dijalankan terpisah setelah script ini selesai.
 *
 * ⚠️ RENTANG TANGGAL DINAMIS (14 Juli — sebelumnya hardcode 1 April-29 Juni
 * 2026, jadi makin basi seiring waktu berjalan karena streak gamifikasi
 * butuh transaksi mendekati "hari ini"):
 *   - Bulan A (lengkap, 2 bulan sebelum bulan berjalan)
 *   - Bulan B (lengkap, 1 bulan sebelum bulan berjalan)
 *   - Bulan C (PARSIAL, bulan berjalan, tanggal 1 s.d. HARI SCRIPT DIJALANKAN)
 * Growth ACS (lihat src/lib/scoring/creditScoreService.ts) HANYA memakai
 * bulan kalender yang sudah LENGKAP (bulan berjalan selalu dikeluarkan) —
 * jadi Growth yang terukur = (B-A)/A, dan Bulan C murni berfungsi supaya
 * `last_activity_date` gamifikasi selalu dekat "hari ini" tanpa mengubah
 * angka Growth. Target: A=Rp96.000.000, B=Rp96.000.000×1.216≈+21,6% —
 * mereplikasi besaran growth yang sudah dilaporkan sebelumnya, terlepas
 * dari kalender bulan mana yang sedang berjalan saat script dijalankan.
 *
 * ⚠️ IDEMPOTENT — WAJIB BISA DIULANG TANPA DOBEL: sebelum generate, script
 * mengecek tanggal (per hari) yang SUDAH punya transaksi untuk UMKM ini,
 * lalu MELEWATI hari itu sepenuhnya (tidak generate, tidak insert). Cuma
 * hari yang benar-benar belum ada datanya yang di-insert. Ini juga otomatis
 * menambal celah tanggal lama (mis. hari kosong di antara batch seed
 * sebelumnya) kalau kebetulan masuk rentang 3 bulan terbaru.
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
const PAGE_SIZE = 1000

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

function daysInMonth(year: number, monthIndex0: number): number {
  return new Date(Date.UTC(year, monthIndex0 + 1, 0)).getUTCDate()
}

function dayKey(year: number, monthIndex0: number, day: number): string {
  return `${year}-${String(monthIndex0 + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
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
// Rencana bulanan DINAMIS — dihitung dari "hari ini" (waktu script
// dijalankan), bukan tanggal hardcode. Lihat catatan di header file.
// ---------------------------------------------------------------------------

const REVENUE_TARGET_A = 96_000_000
const REVENUE_TARGET_B = 116_700_000 // ~+21,6% dari A — replikasi growth yang sudah dilaporkan

const now = new Date()
const curYear = now.getUTCFullYear()
const curMonth0 = now.getUTCMonth() // 0-based
const curDay = now.getUTCDate()

function shiftMonth(year: number, month0: number, delta: number): { year: number; month0: number } {
  const total = year * 12 + month0 + delta
  return { year: Math.floor(total / 12), month0: ((total % 12) + 12) % 12 }
}

const monthA = shiftMonth(curYear, curMonth0, -2)
const monthB = shiftMonth(curYear, curMonth0, -1)

const MONTHS = [
  {
    label: `Bulan A (${monthA.year}-${String(monthA.month0 + 1).padStart(2, '0')}, lengkap)`,
    year: monthA.year,
    month: monthA.month0,
    days: daysInMonth(monthA.year, monthA.month0),
    revenueTarget: REVENUE_TARGET_A,
  },
  {
    label: `Bulan B (${monthB.year}-${String(monthB.month0 + 1).padStart(2, '0')}, lengkap)`,
    year: monthB.year,
    month: monthB.month0,
    days: daysInMonth(monthB.year, monthB.month0),
    revenueTarget: REVENUE_TARGET_B,
  },
  {
    label: `Bulan C (${curYear}-${String(curMonth0 + 1).padStart(2, '0')}, PARSIAL s.d. hari ini)`,
    year: curYear,
    month: curMonth0,
    days: curDay, // hanya s.d. hari ini, bukan seluruh bulan
    // Target diskalakan proporsional terhadap pace Bulan B (bulan lengkap
    // terakhir) — bulan ini selalu dikeluarkan dari kalkulasi Growth
    // (creditScoreService.ts), jadi angka pastinya tidak kritis, cuma
    // supaya kelihatan wajar & tidak ada "jurang" pace dari Bulan B.
    revenueTarget: (REVENUE_TARGET_B / daysInMonth(monthB.year, monthB.month0)) * curDay,
  },
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

/** Ambil semua hari (YYYY-MM-DD) yang SUDAH punya transaksi untuk UMKM ini
 * di rentang [rangeStartIso, rangeEndIso) — dipaginasi (GOTCHA #4, PostgREST
 * default cap 1000 baris per query, jangan sampai diam-diam terpotong). */
async function fetchExistingDayKeys(rangeStartIso: string, rangeEndIso: string): Promise<Set<string>> {
  const keys = new Set<string>()
  let from = 0
  while (true) {
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select('transaction_date')
      .eq('umkm_id', UMKM_ID)
      .gte('transaction_date', rangeStartIso)
      .lt('transaction_date', rangeEndIso)
      .range(from, from + PAGE_SIZE - 1)

    if (error) throw error
    for (const row of data ?? []) {
      keys.add((row.transaction_date as string).slice(0, 10))
    }
    if ((data ?? []).length < PAGE_SIZE) break
    from += PAGE_SIZE
  }
  return keys
}

async function main(): Promise<void> {
  const rangeStartIso = new Date(Date.UTC(monthA.year, monthA.month0, 1)).toISOString()
  const rangeEndIso = new Date(Date.UTC(curYear, curMonth0, curDay + 1)).toISOString() // eksklusif, s.d. akhir hari ini

  console.log(`Rentang target: ${rangeStartIso} s.d. ${rangeEndIso} (eksklusif)`)
  MONTHS.forEach((m) => {
    console.log(`  ${m.label}: ${m.days} hari, target pendapatan Rp${Math.round(m.revenueTarget).toLocaleString('id-ID')}`)
  })
  const growthPct = ((REVENUE_TARGET_B - REVENUE_TARGET_A) / REVENUE_TARGET_A) * 100
  console.log(`Target growth Bulan A -> Bulan B (dipakai kalkulasi ACS): +${growthPct.toFixed(1)}%`)

  console.log('\nMengecek hari yang sudah punya data (supaya tidak dobel)...')
  const existingDayKeys = await fetchExistingDayKeys(rangeStartIso, rangeEndIso)
  console.log(`Ditemukan ${existingDayKeys.size} hari yang sudah punya transaksi di rentang ini — akan DILEWATI.`)

  const plans = buildDayPlans()
  const dailyRevenueTargets = assignDailyRevenueTargets(plans)

  const newPlans = plans.filter((p) => !existingDayKeys.has(dayKey(p.year, p.month, p.day)))
  console.log(`${newPlans.length} dari ${plans.length} hari akan di-generate (sisanya sudah ada, dilewati).`)

  if (newPlans.length === 0) {
    console.log('\nTidak ada hari baru untuk di-generate — data sudah lengkap untuk rentang ini. Selesai (tidak ada insert).')
    return
  }

  const allRows: TransactionRow[] = []
  const perDayCounts: number[] = []

  for (const day of newPlans) {
    const target = dailyRevenueTargets.get(day)!
    const dayRows = generateDayTransactions(day, target)
    perDayCounts.push(dayRows.length)
    allRows.push(...dayRows)
  }

  console.log(`\nTotal transaksi digenerate (hari baru saja): ${allRows.length}`)
  console.log(`Transaksi/hari — min: ${Math.min(...perDayCounts)}, max: ${Math.max(...perDayCounts)}, avg: ${(allRows.length / newPlans.length).toFixed(1)}`)

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

  console.log('\nSeeding selesai. Semua baris baru berstatus classification_status = pending.')
  console.log('Jalankan POST /api/classify setelah ini supaya masuk ledger_entries.')
}

main().catch((err) => {
  console.error('Seeding gagal:', err)
  process.exit(1)
})
