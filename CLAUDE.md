# CLAUDE.md — Panduan Teknis Agen (E-Jatim TrustLink)

> Dibaca **pertama** setiap sesi coding. Tujuan file ini: bikin sesi ke depan lancar, minim error, hemat token — dengan mengunci konvensi & gotcha proyek supaya tidak diulang dari nol.

---

## 1. Tentang Proyek (ringkas)

**E-Jatim TrustLink** — platform *financial middleware* berbasis web: menarik data transaksi digital UMKM (QRIS/e-wallet/marketplace), meng-klasifikasi otomatis ke pos akuntansi SAK EMKM (Auto-Ledger), menghasilkan laporan keuangan + skor kredit alternatif (ACS) + skor reputasi (NLP), untuk kompetisi EJAVEC 2026 (Bank Indonesia). Repo ini adalah **PoC fungsional**, bukan produksi.

Peran repo ini: milik **Anggota A (Tech Lead)** — arsitektur, backend, Auto-Ledger, endpoint laporan.

---

## 2. Tech Stack (terkunci — jangan diganti tanpa alasan kuat)

| Layer | Teknologi |
|---|---|
| Framework | **Next.js 16 — App Router** |
| Bahasa | **TypeScript** |
| Styling | **Tailwind CSS** |
| Database | **Supabase (PostgreSQL)** |
| Auth | **Supabase Auth** (`auth.users`) |
| Keamanan baris | **Row Level Security (RLS)** aktif di semua tabel |
| Dev bundler | **Turbopack** (default `next dev`) |
| Deploy | **Vercel** (`e-jatim.vercel.app`) + GitHub auto-deploy |
| Package manager | **npm / npx** |

---

## 3. Perintah Standar

```bash
# Install dependencies
npm install

# Jalankan development server (Turbopack, http://localhost:3000)
npm run dev

# Build untuk produksi (WAJIB lolos sebelum push — Vercel akan build ulang)
npm run build

# Jalankan hasil build secara lokal
npm run start

# Linter (lihat catatan di §7 — belum di-setup formal)
npm run lint
```

Menjalankan skrip sekali pakai (mis. generator dokumen, seeding): `npx <tool>`.

---

## 4. Struktur Direktori & Routing — ATURAN KERAS

- **Route API WAJIB di `app/api/.../route.ts`** (root `app/`).
- **`src/app/` MATI.** Next.js mengabaikan `src/app` jika root `app/` ada. Route yang salah taruh di `src/app/api/...` akan **build sukses tapi tidak pernah bisa diakses** (silent fail). Jangan pernah buat route di sana.
- Struktur target:

```
app/
  layout.tsx
  page.tsx
  api/
    test-db/route.ts
    classify/route.ts                # Router Tier 1 (regex) → Tier 2 (Hugging Face zero-shot) → tandai needs_tier3
    reports/
      trial-balance/route.ts        # endpoint Neraca Saldo
    reputation-score/route.ts
lib/ (atau utils/)
  supabase/
    client.ts                        # Supabase client sisi browser
    server.ts                        # Supabase client sisi server
  classifier/
    tier1Classifier.ts               # Tier 1 regex (nama sudah benar — perhatikan casing! lihat §6)
    tier2Classifier.ts               # Tier 2 — panggil Hugging Face Inference API (zero-shot)
    regexRules.ts
```

---

## 5. Konvensi Coding

- **TypeScript wajib** untuk semua file baru (`.ts` / `.tsx`). Tidak ada `.js` di source.
- **Server Components sebagai default.** Tambahkan `'use client'` **hanya** saat butuh interaktivitas (state, event handler, hook browser). Endpoint API (`route.ts`) adalah server-only.
- **Arrow function** untuk util/helper; `export async function GET/POST(...)` untuk handler route (mengikuti konvensi App Router).
- **Kalkulasi angka = logic murni (SQL/TypeScript), BUKAN AI.** Trial balance, totals, skor — semua deterministik, tidak boleh lewat LLM. Prinsip: tidak ada risiko halusinasi di angka keuangan.
- **Penamaan file konsisten & lowercase-friendly** (lihat §6). Ikuti casing yang **sudah ada di disk**, jangan menebak.
- **Query Supabase**: selektif kolom (`.select('kolom_a, kolom_b')`), hindari `select('*')` di jalur yang sensitif token/performa.

---

## 6. GOTCHA #1 — Case-sensitivity Windows ↔ Linux (PENTING)

Dev di **Windows** (filesystem case-insensitive), deploy di **Vercel/Linux** + Turbopack (case-**sensitive**).

- Pernah kejadian: file di disk sempat salah nama `tier1classifier.ts` (huruf kecil), diimpor sebagai `tier1Classifier` → jalan di Windows, **gagal resolve di Turbopack/Vercel**. Sudah diperbaiki — nama file sekarang `tier1Classifier.ts` (match dengan importnya).
- Aturan: **nama import harus sama persis (byte-for-byte) dengan nama file di disk.** Kalau ragu, cek nama file asli dulu sebelum menulis import.
- Sebelum push, `npm run build` lokal untuk menangkap error casing lebih awal.

## GOTCHA #2 — Environment Variables

Wajib ada di `.env.local` (lokal) **dan** di Vercel → Settings → Environment Variables (produksi):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
HUGGINGFACE_API_KEY=
```

- `SUPABASE_SERVICE_ROLE_KEY` **server-side only.** JANGAN pernah dipakai/di-expose di komponen client atau variabel `NEXT_PUBLIC_*`.
- `HUGGINGFACE_API_KEY` (ditambahkan 12 Juli, dipakai `src/lib/classifier/tier2Classifier.ts`) — **server-side only** juga, sama seperti service role key. Dipakai untuk memanggil `router.huggingface.co/hf-inference/models/...` (zero-shot classification, Tier 2 Auto-Ledger). **Belum ada di Vercel** — wajib ditambahkan sebelum deploy, kalau tidak Tier 2 akan error di produksi meski jalan normal di lokal.
- Proses backend (AI classification, credit scoring, insert ke `transactions`/`ledger_entries`/`credit_scores`) pakai **service role key** agar tidak diblokir RLS. Ini normal dan hanya dari sisi server.
- Setelah ubah env di Vercel → **redeploy** (atau push commit) supaya berlaku.

## GOTCHA #3 — Supabase belum pakai typed schema

`client.ts`/`server.ts` pakai `createClient()` polos (tanpa generated types). Konsekuensi: **typo nama kolom tidak ke-warning TypeScript**, baru ketahuan saat runtime. Maka: **nama kolom harus ditulis persis** sesuai skema (lihat `PRD.md` §Skema). Type generation = nice-to-have, bukan prioritas sekarang.

## GOTCHA #4 — PostgREST default limit 1000 baris (ditemukan 11 Juli, seed 3 bulan Bu Sari)

`supabaseAdmin.from(...).select(...)` **tanpa** `.range()`/`.limit()` eksplisit otomatis dipotong PostgREST di **1000 baris** — **tanpa error**, jadi query tetap "berhasil" tapi datanya diam-diam tidak lengkap. Ketauan pas `ledger_entries` tembus 1.860 baris (930 transaksi × 2): `/api/reports/trial-balance` sempat melaporkan `is_balance: true` tapi dengan total yang salah (~207 juta, harusnya ~377 juta) — kebetulan `is_balance` tetap `true` karena baris yang terpotong itu belum tentu merusak keseimbangan debit=kredit, jadi bug ini **tidak ketahuan dari flag `is_balance` saja**, harus dicek angka totalnya.

- **Aturan**: query mana pun yang berpotensi mengembalikan >1000 baris (ledger_entries, transactions setelah data tumbuh) **wajib** paginasi pakai loop `.range(from, from+999)` sampai halaman terakhir < 1000 baris. Contoh implementasi: `app/api/reports/trial-balance/route.ts`.
- **Belum diperbaiki**: `/api/classify` fetch `transactions` where `classification_status='pending'` juga tanpa pagination — aman untuk saat ini (pending selalu < 1000), tapi berisiko silent-truncate kalau suatu saat pending menumpuk >1000 baris. Cek/perbaiki sebelum volume data bertambah jauh lebih besar lagi.

---

## 7. Linter & Testing (BELUM di-setup — rekomendasi)

Saat ini proyek **belum** punya konfigurasi linter/test formal. Rekomendasi ringan (kerjakan kalau ada waktu, bukan blocker):

- **ESLint**: aktifkan `eslint-config-next` bawaan → `npm run lint`.
- **Testing**: **Vitest** (ringan, cepat) untuk unit test logic murni — prioritaskan test untuk **Logic Engine** (trial balance harus balance) dan **Tier 1 regex classifier** (9 transaksi dummy → hasil klasifikasi tetap konsisten). Ini titik paling berisiko regresi.
- Jangan over-engineer testing untuk PoC; cukup jaga invariant akuntansi (debit = kredit).

---

## 8. Definition of Done (per perubahan)

- [ ] `npm run build` lolos secara lokal (menangkap error casing & tipe).
- [ ] Casing import = casing file di disk.
- [ ] Tidak ada service role key bocor ke client.
- [ ] Kalau menyentuh ledger/laporan: **trial balance tetap balance** (total debit = total kredit).
- [ ] Route baru ada di `app/api/...`, bukan `src/app/`.