# PRD.md — Product Requirement Document (E-Jatim TrustLink, PoC)

> Cakupan: **PoC untuk EJAVEC 2026**. Fokus pada "cukup untuk demo + validasi metodologi", bukan produk komersial. Framing untuk juri (ekonom BI): masalah ekonomi → bukti data → solusi teknologi → rekomendasi kebijakan.

---

## 1. Objektif

Membuktikan bahwa **data transaksi digital UMKM yang selama ini tidak terpakai** dapat diubah menjadi **jejak digital terpercaya yang bisa dibaca bank**, guna mengurangi asimetri informasi kredit dan mempercepat akses pembiayaan (KUR) untuk UMKM Jawa Timur.

**Masalah inti:** Bank sulit menyalurkan kredit ke UMKM bukan karena tak mau, tapi karena UMKM tak bisa membuktikan kelayakan (tidak ada laporan keuangan formal).

**Solusi PoC:** platform *financial middleware* yang menarik data transaksi (via mock SNAP BI API untuk PoC), meng-klasifikasi otomatis ke SAK EMKM, lalu menghasilkan laporan keuangan + skor kredit alternatif + skor reputasi.

---

## 2. Fitur Utama — IN SCOPE (PoC)

### F1. Auto-Ledger Engine ✅ (Tier 1 & Tier 2 selesai & diverifikasi audit independen 12 Juli — **BERHENTI di Tier 2, final**)
- Tarik/terima data transaksi → klasifikasi ke pos akuntansi SAK EMKM.
- **Pipeline AI hybrid 2 lapis** (⚠️ **bukan 3 lapis** — koreksi, lihat catatan Tier 3 di bawah): Tier 1 Regex (28 rule di `regexRules.ts`, ~93% transaksi seed — 930/994, **selesai & teruji, diaudit independen**) → Tier 2 zero-shot classification via Hugging Face Inference API (~1%, **selesai & teruji**). Transaksi yang lolos dari Tier 1+2 tetap ditandai `classification_status='needs_tier3'` (nama kolom historis, tidak diubah) tapi **TIDAK akan diproses lebih lanjut** — saat ini 55/994 transaksi Bu Sari berstatus ini dan akan tetap begitu selamanya untuk PoC ini.
- **✅ KEPUTUSAN FINAL (14 Juli, bersama Pak Sena/dosen pembimbing): Tier 3 LLM TIDAK akan dibangun sama sekali.** Ini bukan "belum sempat dikerjakan" — ini keputusan final dan permanen, kembali ke status Out of Scope semula (lihat §3). Diagram arsitektur yang pernah dikirim ke Anggota C (menampilkan 3 tingkat Tier) akan **direvisi ulang** untuk menghapus Tier 3 dari diagram itu sendiri (bukan cuma dari kode/dokumen ini) — versi lama dianggap SUDAH TIDAK BERLAKU dan akan digantikan versi baru begitu direvisi.
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

### F3. Alternative Credit Scoring (ACS) — ✅ Growth/Stability/Risk dihitung dari ledger real (13 Juli), Reputation masih placeholder
- `Score = w₁·Growth + w₂·Stability + w₃·Reputation − w₄·RiskFactor`.
- ⚠️ **KEPUTUSAN TIM (12-13 Juli) — model ML Anggota B TIDAK dipakai untuk skor runtime Bu Sari.** Model itu dilatih di dataset publik (Kaggle Home Credit/LendingClub) dengan fitur yang tidak ada padanannya di data ledger UMKM kita — jadi tidak bisa langsung diterapkan ke satu baris data Bu Sari. Random Forest + XGBoost (evaluasi AUC-ROC/F1/Gini/SHAP) tetap jadi **bukti metodologi di paper** (menunjukkan due diligence benchmarking), **bukan** komponen yang menghasilkan angka di runtime PoC ini.
- **Growth, Stability, Risk** kini dihitung deterministik (TypeScript murni, bukan AI — lihat `src/lib/scoring/acsCalculator.ts` + `creditScoreService.ts`) dari `ledger_entries` real Bu Sari, per bulan kalender yang **sudah lengkap** (bulan berjalan dikeluarkan supaya tidak bias oleh jumlah hari parsial):
  - Growth: `clamp(50 + growthPct, 0, 100)`, growthPct = (pendapatan bulan terakhir − bulan pertama) / bulan pertama.
  - Stability: `clamp(100 − CV×100, 0, 100)`, CV = koefisien variasi pendapatan antar-bulan.
  - Risk: `clamp(totalBeban/totalPendapatan × 100, 0, 100)` — proxy kasar rasio beban/pendapatan, BUKAN model risiko tervalidasi statistik.
- **Reputation**: hardcode 50 (netral), aktif di formula **hanya jika** UMKM menyetujui Toggle B (`marketplace_review_access`) di layar consent (lihat F6a baru di bawah). Kalau tidak disetujui, komponen dikeluarkan dan bobotnya didistribusikan ulang ke 3 komponen lain (bukan dihukum jadi 0) — lihat `combineAcsScore()`.
- Bobot `w1=0.35 (Growth), w2=0.25 (Stability), w3=0.20 (Reputation), w4=0.20 (Risk)` — **TENTATIF**, belum ada rujukan pasti dari Anggota B; akan diganti begitu ada hasil benchmarking model ML asli.
- Output: speedometer Hijau (≥70) / Kuning (40-69) / Merah (<40) di `app/dashboard/_components/SpeedometerCard.tsx`.
- ✅ **Verifikasi live (13 Juli)**: skor Bu Sari dihitung ulang dari data ledger sungguhan menghasilkan **58/100 (Kuning)** saat Toggle B tidak disetujui (Growth 71.6, Stability 91.9, Risk 9.5, Reputation tidak aktif), dan **56/100 (Kuning)** saat Toggle B disetujui (Reputation=50 ikut dihitung). Baris dummy lama (`model_version: "v0.1-dummy"`, score 72) sudah **diganti** — `credit_scores` sekarang berisi baris nyata `model_version: "v0.5-ledger-partial"`.
- Growth real (+21,6%, April→Juni, bulan kalender penuh) adalah **angka final resmi** sejak 13 Juli — menggantikan +18,0% yang sempat dikonfirmasi 12 Juli. Kronologi & alasan lengkap kenapa +21,6% dipilih (bukan sekadar "pertambahan data") ada di §5.

### F4. Reputation Score (NLP)
- Analisis sentimen ulasan marketplace (Word2Vec + Random Forest — expertise Pak Sena).
- **Data via CSV** (bukan API) untuk PoC: 15–20 UMKM **riil Jawa Timur** (nama asli) dari Google Maps, dikumpulkan Anggota B; Anggota A tangani import (lookup `business_name` → `umkm_id`).

### F5. Gamifikasi Rapor Sehat Keuangan
- Speedometer visual, tantangan 30 hari, notifikasi progress mingguan (basis Self-Determination Theory).

### F6a. Layar Consent ("Izinkan Akses") — ✅ SELESAI (13 Juli, bagian resmi alur sejak sekarang)
- Langkah baru **wajib** di antara `/masuk` (pilih peran UMKM) dan `/dashboard` — sebelumnya alur langsung `/masuk` → `/dashboard` tanpa consent sama sekali, ini gap yang sudah ditutup.
- **2 toggle terpisah** (bukan satu tombol "Izinkan Akses" umum — syarat hukum eksplisit dari Anggota C): Toggle A "Akses Data Transaksi" (`consent_type = 'transaction_data_access'`, WAJIB untuk fitur inti) dan Toggle B "Akses Ulasan Marketplace" (`consent_type = 'marketplace_review_access'`, opsional, hanya mempengaruhi komponen Reputation di F3). Keduanya default **tidak tercentang**, independen satu sama lain.
- Submit menulis ke `consent_records` (skema sudah eksis, dipakai pertama kali sesi ini) lalu langsung memicu hitung ulang skor ACS (`src/lib/scoring/creditScoreService.ts`) — implementasi di `app/consent/`.

### F6. Alur Verifikasi Sisi Bank 🔜 (skema `loan_applications` diverifikasi 12 Juli — lihat §4.1; framing regulasi DIKOREKSI 13 Juli, lihat §6)
- View sederhana untuk "Analis Kredit" (representasi peran Pak Arief, lihat §5 — **user INTERNAL Bank Jatim**, bukan pihak luar yang menerima laporan dari platform umum): buka profil UMKM → lihat 3 laporan keuangan + skor ACS (kini dihitung dari ledger real, lihat F3) + Reputation Score → aksi approve/reject.
- Mengubah `status` di `loan_applications`, dengan selisih `created_at`→`reviewed_at` (⚠️ **bukan** `submitted_at`→`decided_at` seperti draft awal — kolom itu tidak eksis, lihat §4.1) mensimulasikan verifikasi cepat (~3 hari) sebagai kontras terhadap proses manual 14–30 hari yang jadi argumen masalah di paper.
- Tabel punya kolom tambahan yang belum termanfaatkan di desain awal: `credit_score_id` (FK ke `credit_scores` — pakai ini untuk link ke skor yang direview), `bank_analyst_id`, `decision_notes` (kolom untuk catatan keputusan Pak Arief — bisa dimanfaatkan untuk demo yang lebih kaya).
- **Ini bukan fitur tambahan bebas** — ini prasyarat supaya skenario Pak Arief di Bab 3 bisa didemokan nyata, bukan cuma diceritakan.

### F7. Spesifikasi Mock API (SNAP BI-style) 🔜 (deliverable Minggu 1 — sempat tertunda, lihat TASK.md)
- Dokumen desain OpenAPI 3.0 yang meniru bentuk endpoint SNAP BI (mis. `account-inquiry`, `transaction-history`).
- Dasar tertulis untuk klaim "SNAP BI-compliant reference architecture" di Bab 2/5 paper — bukan sekadar mock endpoint tanpa spek.

---

## 3. OUT OF SCOPE (ditunda / bukan untuk PoC)

- ❌ **Integrasi SNAP BI produksi** (butuh PJP berlisensi) → PoC pakai **mock API**.
- ❌ **Menjadi PKA berlisensi** (POJK 29/2024 butuh modal Rp 5 M + lisensi OJK) → **(⚠️ KOREKSI 13 Juli, lihat §6)** framing lama "middleware integrator yang mengonsumsi output PKA berlisensi" sudah **dibatalkan tim** (Anggota C memvalidasi Pasal 56 POJK 29/2024) — posisi baru: instrumen internal 1 LJK mitra (Bank Jatim) pada fase pilot/PoC.
- ❌ **OCR struk transaksi cash** → diakui sebagai limitasi jujur di paper (jadi argumen insentif adopsi QRIS). Konsekuensi teknis: Auto-Ledger tidak pernah perlu mengekstrak nominal dari teks bebas — nominal selalu terstruktur dari sumber data digital (lihat F1).
- ❌ **Tier 3 LLM (Gemini Flash atau model apa pun)** → **TIDAK dikerjakan sama sekali, permanen** (⚠️ **KEPUTUSAN FINAL 14 Juli, dikonfirmasi bersama Pak Sena/dosen pembimbing** — lihat F1). Auto-Ledger berhenti di Tier 2; 55 transaksi `needs_tier3` Bu Sari tetap tidak terklasifikasi selamanya untuk PoC ini, dan Catatan Laporan Keuangan tetap melaporkannya jujur (lihat F2). Bukan "edge case minimal yang belum sempat dikerjakan" seperti draft sebelumnya — ini pembatalan penuh.
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

**`credit_scores`** — ✅ **diverifikasi 12 Juli (sebelumnya dugaan, BERBEDA dari dugaan awal)**: `id`, `umkm_id`, `score`, `score_category` (⚠️ bukan `band`), `growth_score`, `stability_score`, `reputation_score`, `risk_factor_score` (⚠️ 4 kolom ini masing-masing berakhiran `_score`, beda dari dugaan awal yang lebih pendek), `calculated_at` (⚠️ bukan `computed_at`), `model_version`. **📌 Update 13 Juli**: baris dummy (`model_version: "v0.1-dummy"`, score 72) sudah **diganti** (delete+insert, bukan update in-place — lihat F3) oleh hasil hitung real dari `saveCreditScore()`, `model_version: "v0.5-ledger-partial"`. `reputation_score` bisa `NULL` (Toggle B belum disetujui) — beda dari sebelumnya yang selalu terisi angka dummy.

**`loan_applications`** — ✅ **diverifikasi 12 Juli (sebelumnya dugaan, BERBEDA SIGNIFIKAN — baca sebelum coding F6)**, F6 dibangun & diverifikasi 14 Juli: `id`, `umkm_id`, `credit_score_id` (FK ke `credit_scores`, kolom baru tidak terduga), `requested_amount` (⚠️ bukan `amount_requested`, urutan kata terbalik), `status`, `bank_analyst_id`, `reviewed_at` (⚠️ bukan `decided_at`), `decision_notes` (kolom baru), `created_at`. **⚠️ KOLOM `submitted_at` TIDAK ADA SAMA SEKALI** — draft awal PRD ini salah total mengasumsikan kolom itu ada; pakai `created_at` untuk keperluan yang sama.
>
> **⚠️ KOREKSI 14 Juli — `bank_analyst_id` PUNYA FK constraint nyata** (`loan_applications_bank_analyst_id_fkey` → `auth.users`), ditemukan saat implementasi F6 — BUKAN kolom uuid bebas seperti tersirat sebelumnya. Konsekuensi: nilai ini tidak bisa diisi UUID sembarang untuk persona demo "Pak Arief" (hanya ada 1 baris `auth.users`, yaitu akun Bu Sari sendiri) — kolom ini disimpan `NULL` saat approve/reject di implementasi PoC saat ini, nama analis ditampilkan di UI sebagai label statis terpisah (lihat TASK.md §3.2 untuk detail lengkap). Kalau nanti butuh benar-benar melacak analis per keputusan, perlu akun `auth.users` sungguhan untuk tiap analis, bukan sekadar konstanta.

**RLS**: aktif di semua tabel. UMKM hanya boleh akses datanya sendiri (`auth.uid() = user_id`, atau via subquery `umkm_id in (select id from umkm_profiles where user_id = auth.uid())`). Proses backend memakai **service role key** (bypass RLS, server-side only).

---

## 5. Persona & Data Uji

Bab 3 proposal berisi **dua** skenario stakeholder yang harus benar-benar bisa didemokan (bukan cuma narasi) — keduanya saling terhubung lewat data yang sama:

- **Bu Sari** — Nasi Campur Bu Sari, Surabaya (`business_category`: Kuliner, `city`: Surabaya, `province`: Jawa Timur — data profil terverifikasi 12 Juli). Sisi **pemohon (UMKM)**: consent akses data (layar `/consent`, lihat F6a) → Auto-Ledger jalan dari data transaksi → skor ACS **kini dihitung dari ledger real** (bukan dummy lagi, lihat F3) → ajukan KUR.

> ⚠️ **Catatan seed 3 bulan Bu Sari (selesai 11 Juli)** — 917 transaksi baru (1 Apr–29 Jun 2026) via pipeline Tier 1, ditambah 9 transaksi lama + 4 dari mock-snap ingest. Total 994 transaksi, 939 classified (930 Tier 1 + 9 Tier 2), 55 needs_tier3, 1.878 ledger_entries, **balance** (`total_debit = total_kredit = Rp380.345.000` per 12 Juli, termasuk transaksi uji tambahan).
>
> **✅ KEPUTUSAN RESMI FINAL (13 Juli) — Growth = +21,6% total (April→Juni, bulan kalender penuh).** Ini menggantikan angka +18,0% yang sempat dikonfirmasi 12 Juli.
>
> **Kronologi & akar penyebab (investigasi 13 Juli, dikonfirmasi tuntas — bukan data uji/kontaminasi)**: +18,0% dihitung dari rentang "1 April–29 Juni" — batas tanggal 29 itu **bukan pilihan metodologis**, murni kebetulan teknis: skrip seed 3 bulan (`scripts/seed-bu-sari-3-months.ts`) sengaja berhenti di 29 Juni supaya tidak tumpang tindih tanggal dengan 9 transaksi lama yang sudah ada sejak sebelumnya (mulai 30 Juni). Saat formula ACS (`acsCalculator.ts`) menghitung growth dari **bulan kalender penuh** (standar, tanpa pengecualian tanggal buatan), 1 transaksi asli tanggal 30 Juni (Rp3.500.000, sudah ada sejak sebelum seeding, bukan data baru) ikut terhitung → Juni jadi Rp116.779.000 (bukan Rp113.279.000) → growth naik jadi +21,6%.
>
> **Kenapa +21,6% dipilih sebagai final, bukan +18,0%**: +21,6% pakai definisi yang defensible (3 bulan kalender penuh, tanpa pengecualian tanggal yang sulit dijustifikasi). +18,0% secara teknis "benar" tapi batasnya (29 Juni) tidak punya alasan bisnis — kalau ditelisik juri, jawabannya cuma "kebetulan skrip data testing". Opsi hardcode pengecualian tanggal 30 Juni untuk memaksa hasil tetap 18,0% **secara sadar tidak dipilih** — rapuh, tidak general untuk UMKM/bulan lain.
>
> Detail perhitungan lengkap (langkah demi langkah, termasuk formula Growth & Stability) ada di TASK.md §3.0. Anggota C **sudah diinfokan 13 Juli** untuk mengganti angka di draf Bab 1/5 dari +18,0% ke +21,6% sebelum finalisasi (target beliau 16 Juli).

- **Pak Arief** — Analis Kredit Bank Jatim Cabang Surabaya. ⚠️ **Bukan UMKM kedua** — dia stakeholder sisi **bank/penilai**. Kondisi "sebelum": verifikasi manual 14–30 hari, 60% pengajuan ditolak karena bukti keuangan tidak cukup. Kondisi "sesudah": dia buka laporan + skor yang sudah dihasilkan sistem dari data Bu Sari, lalu approve dalam ~3 hari (diukur dari `created_at`→`reviewed_at` di `loan_applications` — lihat koreksi skema §4.1). **Butuh view UI kedua** (lihat F6) yang mengonsumsi data yang sama dengan sisi Bu Sari.

- **15–20 UMKM riil Jawa Timur** untuk reputation score (nama asli dari Google Maps, dikumpulkan Anggota B) — dataset pendukung F4, terpisah dari dua skenario demo di atas.
- Dataset publik sebagai proxy untuk benchmarking ACS (Kaggle Home Credit / LendingClub yang disesuaikan) + data sekunder BPS/BI Jatim.

---

## 6. Kepatuhan (ringkas — detail di paper)

- **UU PDP 27/2022**: consent management (`consent_records`, kini terpakai sungguhan lewat layar `/consent`, lihat F6a) — 2 consent_type terpisah (`transaction_data_access` wajib, `marketplace_review_access` opsional), teks persetujuan eksplisit Pasal 20 ayat (2) huruf a, enkripsi, dan **DPIA wajib** (Pasal 34 — ACS masuk kategori high-risk). *Compliance-by-Design.*
- **POJK 29/2024** — ⚠️ **KOREKSI 13 Juli (dibatalkan tim, validasi Anggota C):** framing lama "posisikan sebagai konsumen output PKA berlisensi, bukan PKA" **sudah dibatalkan** — Pasal 56 POJK 29/2024 tidak mendukung framing itu untuk sistem yang menghitung skornya sendiri secara internal (bukan mengonsumsi skor pihak lain berlisensi PKA, lihat F3). **Framing baru**: sistem diposisikan sebagai **instrumen internal 1 LJK mitra (Bank Jatim)** pada fase pilot/PoC — konsisten dengan **Rekomendasi Kebijakan 1 (Pilot Sandbox)** di proposal. Skenario Pak Arief (§5, F6) di-framing ulang sebagai **user internal Bank Jatim** yang memakai alat internal, bukan pihak luar independen yang menerima laporan dari platform umum. Disclaimer wajib Pasal 32 ayat (4) POJK 29/2024 ditampilkan di dashboard (lihat `SpeedometerCard.tsx`): skor bukan pemeringkatan PKA berizin OJK dan bukan keputusan kredit.
- **SNAP BI**: reference architecture; PoC pakai mock API — status ini kini ditampilkan eksplisit ke user di layar `/consent` (bukan cuma di paper), teks persis mengacu PADG No. 23/15/PADG/2021.