# PRD.md — Product Requirement Document (E-Jatim TrustLink, PoC)

> Cakupan: **PoC untuk EJAVEC 2026**. Fokus pada "cukup untuk demo + validasi metodologi", bukan produk komersial. Framing untuk juri (ekonom BI): masalah ekonomi → bukti data → solusi teknologi → rekomendasi kebijakan.

---

## 1. Objektif

Membuktikan bahwa **data transaksi digital UMKM yang selama ini tidak terpakai** dapat diubah menjadi **jejak digital terpercaya yang bisa dibaca bank**, guna mengurangi asimetri informasi kredit dan mempercepat akses pembiayaan (KUR) untuk UMKM Jawa Timur.

**Masalah inti:** Bank sulit menyalurkan kredit ke UMKM bukan karena tak mau, tapi karena UMKM tak bisa membuktikan kelayakan (tidak ada laporan keuangan formal).

**Solusi PoC:** platform *financial middleware* yang menarik data transaksi (via mock SNAP BI API untuk PoC), meng-klasifikasi otomatis ke SAK EMKM, lalu menghasilkan laporan keuangan + skor kredit alternatif + skor reputasi.

---

## 2. Fitur Utama — IN SCOPE (PoC)

### F1. Auto-Ledger Engine ✅ (Tier 1 & Tier 2 selesai & diverifikasi audit independen 12 Juli, Tier 3 belum)
- Tarik/terima data transaksi → klasifikasi ke pos akuntansi SAK EMKM.
- **Pipeline AI hybrid 3 lapis**: Tier 1 Regex (28 rule di `regexRules.ts`, ~93% transaksi seed — 930/994, **selesai & teruji, diaudit independen**) → Tier 2 zero-shot classification via Hugging Face Inference API (~1%, **selesai & teruji**) → Tier 3 LLM (Gemini Flash, edge case, *belum dibangun* — transaksi yang lolos dari Tier 1+2 ditandai `classification_status='needs_tier3'`, endpoint-nya sendiri belum ada; saat ini 55/994 transaksi Bu Sari berstatus ini).
- **Model Tier 2 — final, 12 Juli**: model NLI multilingual yang mencakup Bahasa Indonesia (`MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`), dipilih setelah eksplorasi sistematis terhadap 9 model IndoBERT/turunan-Indonesia-asli — lintas 4 jenis task (zero-shot-classification, text-classification, fill-mask, sentence-similarity) — yang ternyata **tidak ter-host gratis** di Hugging Face Inference API, atau untuk yang genuinely ter-host, **terbukti berkualitas lebih rendah secara empiris**. Detail lengkap 2 putaran riset ada di TASK.md §2.2 — ini keputusan final, tidak perlu dieksplorasi ulang.
- Threshold confidence **0.5** (di bawah itu ditandai `needs_tier3`, bukan dipaksa klasifikasi).
- Nominal transaksi (Rupiah) **selalu berasal dari kolom `transactions.amount` yang terstruktur** — tidak pernah diekstrak dari teks bebas (diverifikasi via audit independen 12 Juli, grep menyeluruh: tidak ada logic parsing nominal dari string). Ini keputusan desain yang tepat untuk sumber data QRIS/e-wallet (nominal sudah terstruktur dari sumbernya), bukan gap — OCR struk kertas yang butuh ekstraksi teks eksplisit **Out of Scope** (lihat §3).
- **📌 Catatan untuk Anggota C (penulis paper)**: Bab 2/3 paper **jangan menyebut "IndoBERT" mentah-mentah** untuk Tier 2 — pakai framing di atas ("model NLI multilingual yang mencakup Bahasa Indonesia, dipilih setelah eksplorasi sistematis"). Ini justru poin metodologis yang solid (due diligence), bukan kelemahan — tapi klaimnya harus akurat.
- **Double-entry**: setiap transaksi = 2 baris (debit + kredit), `journal_type` = `kas_masuk` / `kas_keluar` / `umum`. Keputusan final, tidak berubah.
- **Logic Engine** (murni SQL/TypeScript) menghitung totals & laporan — bukan AI. AI (Tier 1/2/3) **hanya** menentukan kategori akun, tidak pernah menghitung nominal debit/kredit.

### F2. Laporan Keuangan / Neraca Saldo ✅ (selesai 12 Juli, diverifikasi audit independen)
- Endpoint **Trial Balance**: agregasi `ledger_entries` per akun berdasarkan `chart_of_accounts`, validasi **total debit = total kredit**.
- **Dashboard** (`app/dashboard/page.tsx`) menampilkan 3 laporan dasar SAK EMKM (Laba Rugi, Posisi Keuangan/Neraca, Catatan) diturunkan dari Trial Balance — logic murni TypeScript di `src/lib/reports/` (`trialBalance.ts`, `financialStatements.ts`, `notes.ts`), bukan AI. Diverifikasi live (bukan cuma laporan lama): render benar, data real-time dari Supabase, cocok persis dengan query independen.
- Neraca menyertakan indikator eksplisit Aset = Liabilitas + Modal (warning jelas kalau tidak seimbang), Catatan secara jujur melaporkan jumlah transaksi `needs_tier3` yang belum tercermin di laporan.

### F3. Alternative Credit Scoring (ACS) — 🔜 belum dibangun (endpoint hitung skor masih backlog)
- `Score = w₁·Growth + w₂·Stability + w₃·Reputation − w₄·RiskFactor`.
- Model: Random Forest + XGBoost; evaluasi AUC-ROC, F1, Gini, SHAP.
- Output: speedometer Hijau/Kuning/Merah (mis. "Hijau 72/100").
- ⚠️ **Temuan 12 Juli**: tabel `credit_scores` sudah punya **1 baris data dummy** untuk Bu Sari (`score: 72, score_category: "Hijau", model_version: "v0.1-dummy"`) — ini kemungkinan besar seed manual/placeholder, **BUKAN** hasil pipeline ACS sungguhan (pipeline-nya sendiri belum dikerjakan Anggota B). Boleh dipakai sebagai placeholder untuk demo UI Minggu 3 (speedometer), **tapi WAJIB ditandai jelas di kode & UI sebagai data dummy** (mis. cek `model_version` mengandung `"dummy"` → tampilkan badge "Contoh/Placeholder") supaya tidak keliru dikira skor ACS asli saat demo/review.

### F4. Reputation Score (NLP)
- Analisis sentimen ulasan marketplace (Word2Vec + Random Forest — expertise Pak Sena).
- **Data via CSV** (bukan API) untuk PoC: 15–20 UMKM **riil Jawa Timur** (nama asli) dari Google Maps, dikumpulkan Anggota B; Anggota A tangani import (lookup `business_name` → `umkm_id`).

### F5. Gamifikasi Rapor Sehat Keuangan
- Speedometer visual, tantangan 30 hari, notifikasi progress mingguan (basis Self-Determination Theory).

### F6. Alur Verifikasi Sisi Bank 🔜 (skema `loan_applications` baru diverifikasi 12 Juli — lihat §4.1, BERBEDA SIGNIFIKAN dari dugaan awal)
- View sederhana untuk "Analis Kredit" (representasi peran Pak Arief, lihat §5): buka profil UMKM → lihat 3 laporan keuangan + skor ACS (placeholder, lihat F3) + Reputation Score → aksi approve/reject.
- Mengubah `status` di `loan_applications`, dengan selisih `created_at`→`reviewed_at` (⚠️ **bukan** `submitted_at`→`decided_at` seperti draft awal — kolom itu tidak eksis, lihat §4.1) mensimulasikan verifikasi cepat (~3 hari) sebagai kontras terhadap proses manual 14–30 hari yang jadi argumen masalah di paper.
- Tabel punya kolom tambahan yang belum termanfaatkan di desain awal: `credit_score_id` (FK ke `credit_scores` — pakai ini untuk link ke skor yang direview), `bank_analyst_id`, `decision_notes` (kolom untuk catatan keputusan Pak Arief — bisa dimanfaatkan untuk demo yang lebih kaya).
- **Ini bukan fitur tambahan bebas** — ini prasyarat supaya skenario Pak Arief di Bab 3 bisa didemokan nyata, bukan cuma diceritakan.

### F7. Spesifikasi Mock API (SNAP BI-style) 🔜 (deliverable Minggu 1 — sempat tertunda, lihat TASK.md)
- Dokumen desain OpenAPI 3.0 yang meniru bentuk endpoint SNAP BI (mis. `account-inquiry`, `transaction-history`).
- Dasar tertulis untuk klaim "SNAP BI-compliant reference architecture" di Bab 2/5 paper — bukan sekadar mock endpoint tanpa spek.

---

## 3. OUT OF SCOPE (ditunda / bukan untuk PoC)

- ❌ **Integrasi SNAP BI produksi** (butuh PJP berlisensi) → PoC pakai **mock API**.
- ❌ **Menjadi PKA berlisensi** (POJK 29/2024 butuh modal Rp 5 M + lisensi OJK) → posisikan sebagai *middleware integrator*, jadi rekomendasi kebijakan.
- ❌ **OCR struk transaksi cash** → diakui sebagai limitasi jujur di paper (jadi argumen insentif adopsi QRIS). Konsekuensi teknis: Auto-Ledger tidak pernah perlu mengekstrak nominal dari teks bebas — nominal selalu terstruktur dari sumber data digital (lihat F1).
- ❌ **Tier 3 LLM real** untuk volume besar → hanya edge case minimal.
- ❌ **Migrasi Data Center Indonesia** (isu PP 71/2019) → roadmap produksi, bukan PoC.
- ❌ **Type generation Supabase, notifikasi push real, multi-tenant scaling** → nice-to-have pasca-lomba.
- ❌ **Auth/onboarding UMKM real** → PoC pakai persona seed ("Bu Sari") + profil dummy.

---

## 4. Skema Data (Supabase / PostgreSQL — 9 tabel + RLS)

> Nama kolom **case-sensitive** di kode (belum ada typed schema, jadi typo tidak ke-warning TypeScript). Tulis persis.

### 4.1 — Terverifikasi dari live DB (audit langsung, bukan asumsi)

**`chart_of_accounts`** (master akun — 21 akun, kode 101–711)
`account_code` (PK, mis. 101), `account_name`, `account_type` (nilai **Inggris**: `'Asset'`/`'Liability'`/`'Equity'`/`'Revenue'`/`'Expense'` — dikonfirmasi ulang via audit 12 Juli, tidak ada logic di codebase yang salah pakai nilai Indonesia), `normal_balance` (`'debit'`/`'credit'`), `is_active`, `created_at`.

**`ledger_entries`** (double-entry — hasil Auto-Ledger)
`id` (uuid PK), `umkm_id` (FK), `transaction_id` (FK, opsional), `account_code` (FK → chart_of_accounts), `entry_side` (`'debit'`/`'credit'`), `amount`, `journal_type` (`kas_masuk`/`kas_keluar`/`umum`), `period_month`, `confidence_score` (terisi nyata untuk Tier 2, bervariasi 0.53–0.91, dikonfirmasi bukan nilai hardcoded), `created_at`. **Invariant: Σamount(entry_side=debit) = Σamount(entry_side=credit).** Model data **long format** — pakai `entry_side`/`amount`, BUKAN `debit`/`kredit` terpisah.

**`marketplace_reviews`** — `id`, `umkm_id`, `platform`, `review_text`, `rating`, `sentiment_label`, `sentiment_confidence`, `review_date`, `created_at`.

**`gamification_progress`** — `id`, `umkm_id`, `challenge_type`, `current_streak`, `longest_streak`, `last_activity_date`, `updated_at`.

**`consent_records`** — `id`, `umkm_id`, `consent_type`, `granted`, `granted_at`, `revoked_at`, `ip_address`, `created_at`.

**`umkm_profiles`** — ✅ **diverifikasi 12 Juli (sebelumnya dugaan)**: `id`, `user_id`, `business_name`, `owner_name`, `business_category` (⚠️ bukan `sector` seperti dugaan awal), `city`, `province` (⚠️ dugaan awal cuma tulis "city/region" ambigu — ternyata 2 kolom terpisah), `qris_merchant_id` (kolom baru, tidak terduga), `consent_given_at` (kolom baru), `created_at`, `updated_at`. Data Bu Sari terverifikasi lengkap: business_name="Nasi Campur Bu Sari", owner_name="Sari Wulandari", business_category="Kuliner", city="Surabaya", province="Jawa Timur".

**`transactions`** — dugaan lama (belum diverifikasi eksplisit sesi ini, tapi terpakai konsisten di seluruh pipeline Tier1/2 tanpa error): `id`, `umkm_id`, `amount`, `description`, `source`, `transaction_date`, `classification_status`, `classification_tier`, `created_at`.

**`credit_scores`** — ✅ **diverifikasi 12 Juli (sebelumnya dugaan, BERBEDA dari dugaan awal)**: `id`, `umkm_id`, `score`, `score_category` (⚠️ bukan `band`), `growth_score`, `stability_score`, `reputation_score`, `risk_factor_score` (⚠️ 4 kolom ini masing-masing berakhiran `_score`, beda dari dugaan awal yang lebih pendek), `calculated_at` (⚠️ bukan `computed_at`), `model_version` (kolom baru, tidak terduga — dipakai untuk menandai `"v0.1-dummy"` pada baris placeholder Bu Sari, lihat F3). Sudah ada 1 baris data (Bu Sari, dummy).

**`loan_applications`** — ✅ **diverifikasi 12 Juli (sebelumnya dugaan, BERBEDA SIGNIFIKAN — baca sebelum coding F6)**: `id`, `umkm_id`, `credit_score_id` (FK ke `credit_scores`, kolom baru tidak terduga), `requested_amount` (⚠️ bukan `amount_requested`, urutan kata terbalik), `status`, `bank_analyst_id` (kolom baru), `reviewed_at` (⚠️ bukan `decided_at`), `decision_notes` (kolom baru), `created_at`. **⚠️ KOLOM `submitted_at` TIDAK ADA SAMA SEKALI** — draft awal PRD ini salah total mengasumsikan kolom itu ada; pakai `created_at` untuk keperluan yang sama. Tabel masih kosong (0 baris) — belum dipakai, sesuai status F6 yang memang belum dikerjakan.

**RLS**: aktif di semua tabel. UMKM hanya boleh akses datanya sendiri (`auth.uid() = user_id`, atau via subquery `umkm_id in (select id from umkm_profiles where user_id = auth.uid())`). Proses backend memakai **service role key** (bypass RLS, server-side only).

---

## 5. Persona & Data Uji

Bab 3 proposal berisi **dua** skenario stakeholder yang harus benar-benar bisa didemokan (bukan cuma narasi) — keduanya saling terhubung lewat data yang sama:

- **Bu Sari** — Nasi Campur Bu Sari, Surabaya (`business_category`: Kuliner, `city`: Surabaya, `province`: Jawa Timur — data profil terverifikasi 12 Juli). Sisi **pemohon (UMKM)**: consent akses data → Auto-Ledger jalan dari data transaksi → skor ACS (target demo: Hijau 72/100 — **saat ini masih data dummy/placeholder di `credit_scores`, lihat F3**, growth arus kas +18% total dari bulan pertama ke bulan ketiga) → ajukan KUR.

> ⚠️ **Catatan seed 3 bulan Bu Sari (selesai 11 Juli)** — 917 transaksi baru (1 Apr–29 Jun 2026) via pipeline Tier 1, ditambah 9 transaksi lama + 4 dari mock-snap ingest. Total 994 transaksi, 939 classified (930 Tier 1 + 9 Tier 2), 55 needs_tier3, 1.878 ledger_entries, **balance** (`total_debit = total_kredit = Rp380.345.000` per 12 Juli, termasuk transaksi uji tambahan).
>
> **✅ KEPUTUSAN RESMI (12 Juli) — Growth = +18% total, bukan per bulan.** Angka final: April Rp96.005.000 → Juni(1-29) Rp113.279.000 = **+18,0% total** — data riil terverifikasi sistem, bukan target manual.

- **Pak Arief** — Analis Kredit Bank Jatim Cabang Surabaya. ⚠️ **Bukan UMKM kedua** — dia stakeholder sisi **bank/penilai**. Kondisi "sebelum": verifikasi manual 14–30 hari, 60% pengajuan ditolak karena bukti keuangan tidak cukup. Kondisi "sesudah": dia buka laporan + skor yang sudah dihasilkan sistem dari data Bu Sari, lalu approve dalam ~3 hari (diukur dari `created_at`→`reviewed_at` di `loan_applications` — lihat koreksi skema §4.1). **Butuh view UI kedua** (lihat F6) yang mengonsumsi data yang sama dengan sisi Bu Sari.

- **15–20 UMKM riil Jawa Timur** untuk reputation score (nama asli dari Google Maps, dikumpulkan Anggota B) — dataset pendukung F4, terpisah dari dua skenario demo di atas.
- Dataset publik sebagai proxy untuk benchmarking ACS (Kaggle Home Credit / LendingClub yang disesuaikan) + data sekunder BPS/BI Jatim.

---

## 6. Kepatuhan (ringkas — detail di paper)

- **UU PDP 27/2022**: consent management (`consent_records`), enkripsi, dan **DPIA wajib** (Pasal 34 — ACS masuk kategori high-risk). *Compliance-by-Design.*
- **POJK 29/2024**: posisikan sebagai konsumen output PKA berlisensi, bukan PKA.
- **SNAP BI**: reference architecture; PoC pakai mock API.