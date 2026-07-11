# TASK.md — Backlog Pekerjaan (Anggota A / Tech Lead)

> Checklist teknis. Centang `[x]` saat selesai. Fokus: pekerjaan dev repo ini. Deadline paper: **1 Agustus 2026**. Disusun ulang **11 Juli 2026** (Minggu 2, hari ke-2) mengikuti `Rencana_Kerja_Tim_EJatim_TrustLink.pdf` — bukan urutan bebas.
>
> **Repo:** https://github.com/MeiwildanFarrel/e-jatim
>
> **Prinsip kunci:** Skenario Bu Sari & Pak Arief di Bab 3 proposal = *acceptance criteria*, bukan narasi hiasan. Tugas di bawah disusun supaya di akhir Minggu 3, kedua skenario itu **benar-benar bisa didemokan**, bukan cuma ditulis di paper.

---

## ✅ Sudah Selesai (baseline, sampai Minggu 2 hari ke-2)

- [x] Setup Next.js 16 (App Router) + TypeScript + Tailwind
- [x] Integrasi Supabase (PostgreSQL + RLS + Auth)
- [x] Deploy ke Vercel (`e-jatim.vercel.app`) + GitHub auto-deploy
- [x] Env variables terpasang di lokal & Vercel; `/api/test-db` connected
- [x] Skema 9 tabel deployed + `chart_of_accounts` (21 akun, 101–711)
- [x] `ledger_entries` versi **double-entry** (journal_type kas_masuk/kas_keluar/umum)
- [x] Seed persona "Bu Sari" — **9 transaksi uji** (masih dummy singkat, lihat catatan di §Minggu 2)
- [x] Tier 1 Auto-Ledger (regex classifier) — teruji di 9 transaksi, **trial balance balance**
- [x] Endpoint `/api/reputation-score` (skeleton) — metode data final: **CSV**

---

## ✅ SUSULAN Minggu 1 (3–9 Juli) — sudah dikonfirmasi selesai (11 Juli)

Target resmi Minggu 1 untuk Anggota A: *"repo siap, skema database ter-deploy, dokumen mock API selesai."* Semua sudah beres:

- [x] Repository Git privat dibuat — https://github.com/MeiwildanFarrel/e-jatim
- [x] Inisialisasi Next.js (App Router) + Supabase project
- [x] Skema database inti dirancang & **ter-deploy**: tabel transaksi, profil UMKM, entri ledger, skor kredit
- [x] RLS policy per pengguna diimplementasikan
- [x] **Spesifikasi mock API OpenAPI 3.0 selesai** — endpoint `account-inquiry`, `transaction-history` meniru SNAP BI, bisa dipakai uji tanpa akses SNAP produksi

*(Item "buat mock endpoint yang meng-implementasikan spec" sebelumnya di sini — pindah jadi catatan terpisah di bawah karena itu bukan bagian dari checklist resmi Minggu 1 kamu, cek status riilnya kalau belum jalan.)*

- [ ] *(opsional, cek status)* Mock endpoint di `app/api/mock-snap/...` yang benar-benar meng-implementasikan spec OpenAPI di atas — kalau speknya baru dokumen dan endpoint-nya belum jalan, ini prasyarat sebelum Auto-Ledger di Minggu 2 bisa "menarik data" secara realistis.

---

## 🚧 MINGGU 2 (10–16 Juli) — SEDANG BERJALAN

Target resmi: *"Auto-Ledger tahap awal jalan, dashboard menampilkan laporan otomatis."* Urutan kerja disepakati: **Trial Balance dulu (hampir selesai) → lalu kejar Tier 2 + Dashboard di sisa minggu ini.**

### 2.1 — Endpoint Neraca Saldo (Trial Balance) — ✅ SELESAI & TERVERIFIKASI (11 Juli)
- [x] Buat `app/api/reports/trial-balance/route.ts` (root `app/`, bukan `src/app/`)
- [x] Query `ledger_entries` + join `chart_of_accounts` (via foreign-key embed PostgREST)
- [x] Agregasi debit/kredit per `account_code`, hitung saldo akhir per akun
- [x] Validasi `total_debit === total_kredit` → field `is_balance`
- [x] Dukung filter opsional `?umkm_id=`
- [x] Uji: response `is_balance: true` untuk data Bu Sari — **terkonfirmasi**, total 26.503.000 balance
- [x] `npm run build` lolos + cek casing import

> Catatan: skema asli `ledger_entries` ternyata pakai `entry_side`+`amount` (bukan `debit`+`kredit` terpisah) — sudah dikoreksi di PRD.md §4.1. Lihat juga kolom baru `confidence_score` yang belum terdokumentasi — klarifikasi pengisiannya sebelum dipakai di laporan lain.

### 2.2 — Auto-Ledger Tier 2 (NLI Multilingual via Hugging Face Inference API) — ✅ SELESAI, MODEL FINAL (12 Juli)
- [x] Tentukan mekanisme serving: **Hugging Face Inference API** (bukan self-hosted, bukan mock) — lihat `src/lib/classifier/tier2Classifier.ts`
- [x] Router klasifikasi: Tier 1 (regex) → fallback Tier 2 (zero-shot) → tandai sisa `needs_tier3` — diimplementasikan langsung di `/api/classify` (satu endpoint, satu alur, bukan endpoint terpisah)
- [x] Map output label zero-shot → `account_code` SAK EMKM — via `account_name` dari `chart_of_accounts` (16 akun relevan, bukan semua 21)
- [x] Pastikan hasil Tier 2 tetap menghasilkan pasangan debit/kredit yang balance — **terverifikasi**, lihat hasil uji di bawah
- [x] Uji terhadap transaksi "aneh" (edge case) — 8 transaksi uji baru dengan bahasa natural (bukan pola regex), lihat hasil di bawah

> ✅ **KEPUTUSAN MODEL FINAL (12 Juli, setelah 2 putaran riset) — tidak diperdebatkan lagi:** keputusan arsitektur awal bilang "IndoBERT ASLI". Setelah riset sistematis 2 kali:
> - **Putaran 1**: 2 model IndoBERT/Indo-RoBERTa Indonesia asli untuk task zero-shot-classification (`StevenLimcorn/indo-roberta-indonli`, `LazarusNLP/indobert-lite-base-p1-indonli-distil-mdeberta`) — **keduanya TIDAK di-host** provider `hf-inference` (`"Model not supported by provider hf-inference"`). Filter resmi huggingface.co/models (`inference=warm` + `pipeline_tag=zero-shot-classification` + `language=id`) mengonfirmasi cuma 1 model yang lolos: `MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`.
> - **Putaran 2** (perluasan ke task lain — text-classification, fill-mask, sentence-similarity, bukan cuma zero-shot): 7 model IndoBERT-family lain dicoba (`indobenchmark/indobert-base-p1` [1,14 juta downloads — IndoBERT terpopuler, tetap TIDAK ter-host], `indolem/indobert-base-uncased`, `ayameRushia/indobert-base-uncased-finetuned-indonlu-smsa`, `apriandito/indobert-sentiment-classifier` — 4 di atas semua TIDAK ter-host; `indolem/indobertweet-base-uncased`, `cahya/bert-base-indonesian-1.5G`, `firqaaa/indo-sentence-bert-base` — 3 ini genuinely ter-host, tapi kualitasnya **terbukti lebih rendah** dari mDeBERTa: prediksi fill-mask tidak relevan ke kategori akuntansi, dan sentence-similarity salah top-1 di kasus jelas ("beli bahan baku" ranking teratas malah "Pendapatan Penjualan").
> - **Total 9 model dicoba, 0 yang layak menggantikan mDeBERTa.** Endpoint lama `api-inference.huggingface.co` juga sudah tidak resolve sama sekali — endpoint yang benar `router.huggingface.co/hf-inference/models/{model_id}`.
>
> **`MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7` adalah model Tier 2 permanen.** Framing resmi untuk paper: lihat PRD.md §F1 (catatan untuk Anggota C). Tidak perlu cari model IndoBERT lain lagi — kalau nanti ekosistem HF Inference Providers berubah signifikan (model baru ter-host), baru dipertimbangkan ulang, bukan prioritas sekarang. Kalaupun begitu, mengganti tinggal ubah `HF_MODEL` di `tier2Classifier.ts` — tidak ada perubahan struktural lain.

> **Threshold confidence 0.5** (nilai default yang disarankan task, dikonfirmasi lewat 6 uji coba manual sebelum implementasi — lihat laporan sesi). Di atas 0.5 hasil konsisten masuk akal (0.53–0.91), di bawah 0.5 konsisten meleset/ambigu (0.11–0.33). `classification_status` baru: `needs_tier3` (kolom `text` bebas, tidak ada constraint DB yang perlu diubah).
>
> **Uji volume (12 Juli)** — 56 transaksi uji tambahan (bahasa natural, diverifikasi programatis lewat `classifyTransaction()` langsung supaya dijamin 0% ke-Tier 1, bukan cuma dicek manual), dijalankan lewat `/api/classify` sungguhan: **79,2 detik total, 0 error, 0 tanda rate-limit** (waktu/request ~1,4s, konsisten dari awal sampai akhir — tidak ada pola perlambatan yang mengindikasikan throttling). Hasil: 0 Tier 1, **6 Tier 2** (confidence 0,511–0,608 — lebih rendah & lebih sempit dari batch 8-transaksi sebelumnya, wajar karena bahasanya sengaja dibuat lebih samar), **50 `needs_tier3`**. Trial balance tetap balance setelah penambahan (diverifikasi independen lewat endpoint `/api/reports/trial-balance`, bukan cuma angka dari `/api/classify` sendiri): `total_debit = total_kredit = Rp380.345.000`. Total akumulasi Bu Sari sekarang: **994 transaksi** (939 classified: 930 regex + 9 indobert; 55 `needs_tier3`; 0 pending), **1.878 `ledger_entries`**.
>
> Catatan jujur: pada volume 56 request sekaligus, tidak ada rate limit yang kena — tapi ini belum tentu representatif untuk skenario "ribuan transaksi pending sekaligus" (mis. kalau nanti ada re-run massal). Kalau perlu pipeline Tier 2 untuk volume jauh lebih besar, pertimbangkan batching/backoff — belum diperlukan sekarang.
>
> **Hasil uji 8 transaksi baru** (bahasa natural, sengaja tidak match regex Tier 1): 0 ke-Tier 1, **3 ke-Tier 2** (confidence 0.533/0.913/0.676 — akun 400, 130, 401), **5 ditandai `needs_tier3`**. Trial balance Bu Sari tetap balance setelah penambahan: `total_debit = total_kredit = Rp379.350.000`.

### 2.3 — Dashboard laporan sederhana — ✅ SELESAI & TERVERIFIKASI (12 Juli)
- [x] Halaman dashboard menampilkan hasil klasifikasi dalam bentuk **3 laporan dasar**: Laba Rugi, Posisi Keuangan (Neraca), Catatan — `app/dashboard/page.tsx` (fungsional, styling minimal ikut `DESIGN.md` — navy/slate, Geist, format Rupiah `Rp1.234.567`)
- [x] Data laporan bersumber dari endpoint Trial Balance (2.1) yang sudah jalan — logic-nya **diekstrak** ke `src/lib/reports/trialBalance.ts` supaya dipakai bareng oleh endpoint API dan Server Component (bukan self-fetch HTTP dari dalam Server Component, bukan duplikasi logic) — `app/api/reports/trial-balance/route.ts` sekarang jadi thin wrapper, **perilaku eksternalnya tidak berubah** (diverifikasi byte-identical sebelum/sesudah refactor)
- [x] Kalkulasi Laba Rugi & Neraca (termasuk cek Aset=Liabilitas+Modal) = logic murni TypeScript di `src/lib/reports/financialStatements.ts`, bukan AI

> **Catatan teknis penting — kenapa Neraca bisa balance**: ledger ini belum pernah "ditutup" (belum ada jurnal penutup akhir periode), jadi akun Pendapatan/Beban masih terbuka di trial balance kapan pun diquery. Supaya Aset = Liabilitas + Modal benar-benar balance (bukan kebetulan), Laba/Rugi Tahun Berjalan (dari Laba Rugi) dimasukkan sebagai baris di dalam Modal — ini turunan langsung dari invariant trial balance (Σdebit=Σkredit) dan praktik standar akuntansi untuk neraca interim yang belum ditutup, **bukan modifikasi data** untuk memaksa balance. Kalau ini tidak dilakukan, Neraca akan SELALU "tidak balance" secara palsu (positif-palsu) setiap kali ada aktivitas Pendapatan/Beban yang belum ditutup — bukan sinyal masalah data yang sesungguhnya.
>
> ⚠️ **Koreksi ditemukan saat bangun halaman ini**: PRD.md §4.1 menulis `account_type` di `chart_of_accounts` sebagai istilah Indonesia (`Aset/Liabilitas/Modal/Pendapatan/Beban`) — dicek langsung ke live DB, nilai aslinya **istilah Inggris** (`Asset/Liability/Equity/Revenue/Expense`). Sudah dikoreksi di PRD.md §4.1.
>
> **Verifikasi (12 Juli)**: `npm run build` lolos. Dibuka langsung di browser (`/dashboard`), data Bu Sari nyata: Total Pendapatan Rp340.273.000, Total Beban Rp31.239.000, **Laba Bersih Rp309.034.000**; Total Aset Rp316.572.000 = Total Liabilitas (Rp0) + Total Modal Rp316.572.000 (Modal Pemilik Rp7.538.000 + Laba Tahun Berjalan Rp309.034.000) — **✓ seimbang**, dicek silang manual terhadap trial balance dan cocok persis. Catatan menampilkan warning "55 transaksi menunggu klasifikasi lanjutan (Tier 3)" dengan benar. Tidak ada error console/server.

### 2.4 — Perluasan seed data Bu Sari (ketemu di diskusi Bab 3, prasyarat untuk Minggu 3) — ✅ SELESAI & TERVERIFIKASI (11 Juli)
- [x] Generate ulang seed Bu Sari jadi **rentang ~3 bulan transaksi** (bukan 9 transaksi tunggal) — 1 Apr–29 Jun 2026, 917 transaksi baru (5–15/hari, non-seragam), ditambahkan via `scripts/seed-bu-sari-3-months.ts` (insert `transactions` saja, lalu diklasifikasi lewat `/api/classify` yang sudah ada — bukan insert manual ke `ledger_entries`). 9 transaksi lama + 4 dari mock-snap ingest **tidak dihapus**. Total sekarang: 930 transaksi, 1.860 `ledger_entries`.
- [x] Pastikan hasil klasifikasi Tier 1+2 tetap balance di volume data yang lebih besar ini — **balance** (`total_debit = total_kredit = Rp376.925.000`). Catatan: masih Tier 1 saja (Tier 2 belum ada saat itu, lihat 2.2), tapi semua 917 transaksi baru memang sengaja ditulis pakai deskripsi yang cocok pola regex Tier 1 yang sudah ada, jadi 0 pending.

> ⚠️ **Bug ditemukan & diperbaiki saat verifikasi**: `/api/reports/trial-balance` (dibuat sesi sebelumnya) fetch semua `ledger_entries` dalam satu query tanpa pagination — begitu jumlah baris tembus limit default PostgREST (1000), hasil agregasinya **diam-diam terpotong** (sempat melaporkan `is_balance: true` tapi dengan total yang salah, ~207 juta padahal harusnya ~377 juta). Sudah diperbaiki dengan `.range()` loop di `app/api/reports/trial-balance/route.ts`.

> **✅ KEPUTUSAN (12 Juli):** Growth ACS resmi = **+18% total** (bukan per bulan) — lihat PRD.md §5 untuk detail & angka final. Tier 2 (2.2 di bawah) akan pakai **Hugging Face Inference API (zero-shot classification)**, bukan self-hosted server sendiri maupun mock murni — real NLP tanpa beban infra.

### 2.2b — Fix pagination `/api/classify` — ✅ SELESAI & TERVERIFIKASI (12 Juli)
- [x] Tambahkan `.range()` loop yang sama seperti fix di `trial-balance/route.ts` ke query `transactions` where `classification_status='pending'` di `/api/classify`
- [x] Verifikasi tidak ada regresi: `npm run build` lolos, trial-balance Bu Sari tetap `is_balance: true` total Rp376.925.000 (tidak berubah), re-run classify → `classified:0, pending:0` (930/930 tetap classified, tidak ada duplikasi)

> Temuan tambahan (di luar yang diminta secara literal, tapi bug yang sama persis di file yang sama): query `transactions` pending bukan satu-satunya yang tanpa pagination di `/api/classify` — dua query lain di endpoint yang sama (SUM `ledger_entries` per `entry_side` untuk field `trial_balance` di response) juga rentan bug GOTCHA #4. Ikut diperbaiki sekalian (pola `.range()` yang sama), karena keduanya di file yang sama dan justru menghitung angka yang dikembalikan endpoint ini sendiri.

---

## 🔜 MINGGU 3 (17–23 Juli) — Integrasi & Elemen Pembeda

Target resmi Anggota A: *"PoC end-to-end bisa didemokan dari input transaksi sampai skor kredit tampil."* Ini mencakup **dua** skenario Bab 3 — catatan penting soal Pak Arief di bawah.

### 3.1 — Speedometer & Gamifikasi (sisi Bu Sari)
- [ ] Ambil output skor dari model Anggota B (JSON/API sederhana), tampilkan speedometer Hijau/Kuning/Merah di dashboard
- [ ] Modul gamifikasi ringan: progres tantangan 30 hari + notifikasi sederhana (pakai `gamification_progress`)

### 3.2 — Alur sisi Bank (skenario Pak Arief) — **KOREKSI dari catatan sebelumnya**
> ⚠️ Pak Arief **bukan** UMKM kedua yang perlu di-seed terpisah — dia Analis Kredit Bank Jatim di Bab 3. Skenarionya: dia melihat laporan+skor yang sudah dihasilkan dari data UMKM (Bu Sari), lalu approve dalam hitungan hari (bukan 14-30 hari manual). Yang perlu dibangun bukan data baru, tapi **sudut pandang UI kedua** dari data yang sama:

- [ ] Halaman/view sederhana sisi "Analis Kredit": buka profil UMKM → lihat 3 laporan + skor ACS + Reputation Score
- [ ] Aksi approve/reject yang mengubah `status` di `loan_applications` (draft/submitted → approved/rejected), dengan `submitted_at` & `decided_at` mencerminkan simulasi "3 hari" (kontras ke 14-30 hari manual di narasi)
- [ ] Siapkan 2 skenario demo (Bu Sari sisi UMKM + Pak Arief sisi bank) yang saling terhubung datanya

---

## 🔜 MINGGU 4 (24–31 Juli) — Finalisasi & Submit

Target resmi Anggota A: *"Finalisasi Bab 2 & 3 berdasarkan sistem yang benar-benar berfungsi — hindari overclaim fitur yang belum berjalan. Rekam demo 2–3 menit."*

- [ ] Rekam demo (screen recording) atau siapkan screenshot alur lengkap: Bu Sari (UMKM) → Pak Arief (bank)
- [ ] Review ulang Bab 2 & Bab 3 paper: pastikan setiap klaim fitur **match** dengan yang benar-benar jalan di sistem (cross-check terhadap checklist di atas)
- [ ] Bantu Anggota C cross-check angka yang berulang di berbagai bab (mis. 4,66 juta merchant QRIS harus konsisten)

---

## 📋 Backlog Pendukung (koordinasi tim, prioritas menyesuaikan minggu di atas)

### Reputation Score — profil UMKM riil (utk modul Anggota B)
- [ ] Insert 15–20 profil UMKM ke `umkm_profiles` (nama **riil Jawa Timur** dari Anggota B, wajib Jatim)
- [ ] Bangun pipeline import CSV → `marketplace_reviews` dengan lookup `business_name` → `umkm_id`
- [ ] Handle baris tak ter-match (nama tak ketemu) → log, jangan gagal senyap
- [ ] Sediakan template kolom CSV untuk Anggota B (platform, review_text, rating, review_date)

### ACS (koordinasi dgn Anggota B/ML)
- [ ] Endpoint hitung skor: `Score = w₁·Growth + w₂·Stability + w₃·Reputation − w₄·RiskFactor`
- [ ] Simpan hasil ke `credit_scores` + band hijau/kuning/merah
- [ ] Benchmarking model (LR baseline vs RF vs XGBoost) — AUC/F1/Gini/SHAP (kerjaan utama Anggota B, Tech Lead hanya integrasi output)

### Compliance-by-Design (dukungan teknis paper Anggota C)
- [ ] Endpoint/log consent → `consent_records` (audit trail UU PDP)
- [ ] Catatan enkripsi (AES-256) & flag data high-risk untuk DPIA

### Kualitas (opsional PoC — lihat CLAUDE.md §7)
- [ ] Aktifkan ESLint (`eslint-config-next`) → `npm run lint`
- [ ] Vitest: unit test Logic Engine (invariant debit=kredit) + Tier 1 classifier

---

## ⚠️ Jangan Lupa (dari CLAUDE.md)
- Route selalu di `app/api/...`
- Casing import = casing file di disk (Windows→Linux)
- Service role key server-side only
- Setiap perubahan ledger/laporan: pastikan **trial balance tetap balance**
- Jangan tulis klaim fitur di paper (Bab 2/3) yang belum benar-benar berjalan di sistem