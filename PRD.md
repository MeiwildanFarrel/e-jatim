# PRD.md — Product Requirement Document (E-Jatim TrustLink, PoC)

> Cakupan: **PoC untuk EJAVEC 2026**. Fokus pada "cukup untuk demo + validasi metodologi", bukan produk komersial. Framing untuk juri (ekonom BI): masalah ekonomi → bukti data → solusi teknologi → rekomendasi kebijakan.

---

## 1. Objektif

Membuktikan bahwa **data transaksi digital UMKM yang selama ini tidak terpakai** dapat diubah menjadi **jejak digital terpercaya yang bisa dibaca bank**, guna mengurangi asimetri informasi kredit dan mempercepat akses pembiayaan (KUR) untuk UMKM Jawa Timur.

**Masalah inti:** Bank sulit menyalurkan kredit ke UMKM bukan karena tak mau, tapi karena UMKM tak bisa membuktikan kelayakan (tidak ada laporan keuangan formal).

**Solusi PoC:** platform *financial middleware* yang menarik data transaksi (via mock SNAP BI API untuk PoC), meng-klasifikasi otomatis ke SAK EMKM, lalu menghasilkan laporan keuangan + skor kredit alternatif + skor reputasi.

---

## 2. Fitur Utama — IN SCOPE (PoC)

### F1. Auto-Ledger Engine ✅ (Tier 1 & Tier 2 selesai, Tier 3 belum)
- Tarik/terima data transaksi → klasifikasi ke pos akuntansi SAK EMKM.
- **Pipeline AI hybrid 3 lapis**: Tier 1 Regex (~60%, **selesai & teruji**) → Tier 2 zero-shot classification via Hugging Face Inference API (~30%, **selesai & teruji 12 Juli**) → Tier 3 LLM (Gemini Flash, ~10%, edge case, *belum dibangun* — transaksi yang lolos dari Tier 1+2 ditandai `classification_status='needs_tier3'`, endpoint-nya sendiri belum ada).
- **Model Tier 2 — final, 12 Juli**: model NLI multilingual yang mencakup Bahasa Indonesia (`MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7`), dipilih setelah eksplorasi sistematis terhadap 9 model IndoBERT/turunan-Indonesia-asli — lintas 4 jenis task (zero-shot-classification, text-classification, fill-mask, sentence-similarity) — yang ternyata **tidak ter-host gratis** di Hugging Face Inference API, atau untuk yang genuinely ter-host, **terbukti berkualitas lebih rendah secara empiris** (contoh: salah top-1 di kasus jelas, confidence tidak terdiferensiasi). Detail lengkap 2 putaran riset ada di TASK.md §2.2 — ini keputusan final, tidak perlu dieksplorasi ulang.
- Threshold confidence **0.5** (di bawah itu ditandai `needs_tier3`, bukan dipaksa klasifikasi).
- **📌 Catatan untuk Anggota C (penulis paper)**: Bab 2/3 paper **jangan menyebut "IndoBERT" mentah-mentah** untuk Tier 2 — pakai framing di atas ("model NLI multilingual yang mencakup Bahasa Indonesia, dipilih setelah eksplorasi sistematis"). Ini justru poin metodologis yang solid (due diligence), bukan kelemahan — tapi klaimnya harus akurat.
- **Double-entry**: setiap transaksi = 2 baris (debit + kredit), `journal_type` = `kas_masuk` / `kas_keluar` / `umum`. Keputusan final, tidak berubah.
- **Logic Engine** (murni SQL/TypeScript) menghitung totals & laporan — bukan AI. AI (Tier 1/2/3) **hanya** menentukan kategori akun, tidak pernah menghitung nominal debit/kredit.

### F2. Laporan Keuangan / Neraca Saldo ✅ (selesai 12 Juli)
- Endpoint **Trial Balance**: agregasi `ledger_entries` per akun berdasarkan `chart_of_accounts`, validasi **total debit = total kredit**.
- **Dashboard** (`app/dashboard/page.tsx`) menampilkan 3 laporan dasar SAK EMKM (Laba Rugi, Posisi Keuangan/Neraca, Catatan) diturunkan dari Trial Balance — logic murni TypeScript di `src/lib/reports/` (`trialBalance.ts`, `financialStatements.ts`, `notes.ts`), bukan AI.
- Neraca menyertakan indikator eksplisit Aset = Liabilitas + Modal (warning jelas kalau tidak seimbang), Catatan secara jujur melaporkan jumlah transaksi `needs_tier3` yang belum tercermin di laporan.

### F3. Alternative Credit Scoring (ACS)
- `Score = w₁·Growth + w₂·Stability + w₃·Reputation − w₄·RiskFactor`.
- Model: Random Forest + XGBoost; evaluasi AUC-ROC, F1, Gini, SHAP.
- Output: speedometer Hijau/Kuning/Merah (mis. "Hijau 72/100").

### F4. Reputation Score (NLP)
- Analisis sentimen ulasan marketplace (Word2Vec + Random Forest — expertise Pak Sena).
- **Data via CSV** (bukan API) untuk PoC: 15–20 UMKM **riil Jawa Timur** (nama asli) dari Google Maps, dikumpulkan Anggota B; Anggota A tangani import (lookup `business_name` → `umkm_id`).

### F5. Gamifikasi Rapor Sehat Keuangan
- Speedometer visual, tantangan 30 hari, notifikasi progress mingguan (basis Self-Determination Theory).

### F6. Alur Verifikasi Sisi Bank 🔜 (ditambahkan setelah pembedahan Bab 3 — sebelumnya tidak eksplisit di scope)
- View sederhana untuk "Analis Kredit" (representasi peran Pak Arief, lihat §5): buka profil UMKM → lihat 3 laporan keuangan + skor ACS + Reputation Score → aksi approve/reject.
- Mengubah `status` di `loan_applications`, dengan selisih `submitted_at`→`decided_at` mensimulasikan verifikasi cepat (~3 hari) sebagai kontras terhadap proses manual 14–30 hari yang jadi argumen masalah di paper.
- **Ini bukan fitur tambahan bebas** — ini prasyarat supaya skenario Pak Arief di Bab 3 bisa didemokan nyata, bukan cuma diceritakan.

### F7. Spesifikasi Mock API (SNAP BI-style) 🔜 (deliverable Minggu 1 — sempat tertunda, lihat TASK.md)
- Dokumen desain OpenAPI 3.0 yang meniru bentuk endpoint SNAP BI (mis. `account-inquiry`, `transaction-history`).
- Dasar tertulis untuk klaim "SNAP BI-compliant reference architecture" di Bab 2/5 paper — bukan sekadar mock endpoint tanpa spek.

---

## 3. OUT OF SCOPE (ditunda / bukan untuk PoC)

- ❌ **Integrasi SNAP BI produksi** (butuh PJP berlisensi) → PoC pakai **mock API**.
- ❌ **Menjadi PKA berlisensi** (POJK 29/2024 butuh modal Rp 5 M + lisensi OJK) → posisikan sebagai *middleware integrator*, jadi rekomendasi kebijakan.
- ❌ **OCR struk transaksi cash** → diakui sebagai limitasi jujur di paper (jadi argumen insentif adopsi QRIS).
- ❌ **Tier 3 LLM real** untuk volume besar → hanya edge case minimal.
- ❌ **Migrasi Data Center Indonesia** (isu PP 71/2019) → roadmap produksi, bukan PoC.
- ❌ **Type generation Supabase, notifikasi push real, multi-tenant scaling** → nice-to-have pasca-lomba.
- ❌ **Auth/onboarding UMKM real** → PoC pakai persona seed ("Bu Sari") + profil dummy.

---

## 4. Skema Data (Supabase / PostgreSQL — 9 tabel + RLS)

> Nama kolom **case-sensitive** di kode (belum ada typed schema, jadi typo tidak ke-warning TypeScript). Tulis persis.

> ⚠️ **Status verifikasi kolom** — jangan anggap semua tabel di bawah sama-sama pasti. Tabel di §4.1 dikutip persis dari SQL yang pernah tampil di sesi coding. Tabel di §4.2 direkonstruksi dari pola penamaan proyek — **cek ke Supabase Table Editor / hasil `\d nama_tabel` sebelum dipakai di kode**, terutama nama kolom yang bisa saja beda (mis. `debit`/`kredit` vs `debit_amount`/`credit_amount`).

### 4.1 — Terverifikasi dari SQL asli

**`chart_of_accounts`** (master akun — 21 akun, kode 101–711)
`account_code` (PK, mis. 101), `account_name`, `account_type` — ⚠️ **koreksi 12 Juli, dicek langsung ke live DB saat bangun dashboard**: nilai asli **istilah Inggris** `'Asset'`/`'Liability'`/`'Equity'`/`'Revenue'`/`'Expense'`, BUKAN `Aset/Liabilitas/Modal/Pendapatan/Beban` seperti tertulis di draft awal — kalau menulis query/grouping baru berdasarkan `account_type`, pakai nilai Inggris. `normal_balance` (`'debit'`/`'credit'` — istilah Inggris, terverifikasi 11 Juli), `is_active`, `created_at`.

**`ledger_entries`** (double-entry — hasil Auto-Ledger) — ✅ **diverifikasi langsung dari live Supabase schema (11 Juli, via endpoint Trial Balance)**
`id` (uuid PK), `umkm_id` (FK), `transaction_id` (FK, opsional), `account_code` (FK → chart_of_accounts), **`entry_side`** (`'debit'`/`'credit'` — bukan kolom debit & kredit terpisah), **`amount`** (nominal tunggal, sisi ditentukan `entry_side`), `journal_type` (`kas_masuk`/`kas_keluar`/`umum`), `period_month`, **`confidence_score`** (skor keyakinan klasifikasi — belum diketahui detail pengisiannya, perlu diklarifikasi ke Anggota A), `created_at`. **Invariant: Σamount(entry_side=debit) = Σamount(entry_side=credit).**

> ⚠️ Koreksi dari draft awal: model data ini **long format** (satu kolom `amount` + penanda sisi), bukan **wide format** (kolom `debit` & `kredit` terpisah) seperti asumsi sebelumnya. Kalau menulis query/endpoint baru yang menyentuh `ledger_entries`, pakai `entry_side`/`amount`, BUKAN `debit`/`kredit`.

**`chart_of_accounts`** — koreksi nilai `normal_balance`: pakai istilah **Inggris** `'debit'`/`'credit'`, bukan `'debit'`/`'kredit'`.

**`marketplace_reviews`** (input Reputation Score)
`id` (uuid PK), `umkm_id` (FK), `platform` (tokopedia/shopee/google_maps), `review_text`, `rating`, `sentiment_label` (positif/netral/negatif), `sentiment_confidence` (numeric 4,3), `review_date`, `created_at`.

**`gamification_progress`**
`id` (uuid PK), `umkm_id` (FK), `challenge_type` (mis. `30_day_recording_streak`), `current_streak`, `longest_streak`, `last_activity_date`, `updated_at`.

**`consent_records`** (audit trail UU PDP)
`id` (uuid PK), `umkm_id` (FK), `consent_type` (`transaction_data_access`/`marketplace_review_access`), `granted` (bool), `granted_at`, `revoked_at`, `ip_address`, `created_at`.

### 4.2 — Belum terverifikasi (direkonstruksi dari pola, ⚠️ cek dulu ke DB asli)

**`umkm_profiles`** — dugaan: `id` (uuid PK), `user_id` (FK → `auth.users`), `business_name`, `owner_name`, `sector`, `city`/`region`, `created_at`.

**`transactions`** (data mentah transaksi) — dugaan: `id` (uuid PK), `umkm_id` (FK), `amount`, `description`, `source` (qris/gopay/dll), `transaction_date`, `created_at`.

**`credit_scores`** (output ACS) — dugaan: `id` (uuid PK), `umkm_id` (FK), `score`, `growth`, `stability`, `reputation`, `risk_factor`, `band` (hijau/kuning/merah), `computed_at`.

**`loan_applications`** — dugaan: `id` (uuid PK), `umkm_id` (FK), `amount_requested`, `status` (draft/submitted/approved/rejected), `submitted_at`, `decided_at`. *(Tabel ini jadi krusial untuk F6/skenario Pak Arief — prioritaskan verifikasi kolom asli sebelum mulai kerjakan Minggu 3.)*

**Index** (dugaan pola umum, belum diverifikasi): `umkm_id` di sebagian besar tabel; `ledger_entries(umkm_id, period_month)`; `loan_applications(status)`.

**RLS**: aktif di semua tabel. UMKM hanya boleh akses datanya sendiri (`auth.uid() = user_id`, atau via subquery `umkm_id in (select id from umkm_profiles where user_id = auth.uid())`). Proses backend memakai **service role key** (bypass RLS, server-side only).

---

## 5. Persona & Data Uji

Bab 3 proposal berisi **dua** skenario stakeholder yang harus benar-benar bisa didemokan (bukan cuma narasi) — keduanya saling terhubung lewat data yang sama:

- **Bu Sari** — Nasi Campur Bu Sari, Surabaya. Sisi **pemohon (UMKM)**: consent akses data → Auto-Ledger jalan dari data transaksi → skor ACS (target demo: Hijau 72/100, **growth arus kas +18% total dari bulan pertama ke bulan ketiga** — lihat keputusan resmi di bawah) → ajukan KUR. ~~**Perlu seed data rentang ~3 bulan**~~ **Selesai 11 Juli** — lihat catatan seed 3 bulan di bawah.

> ⚠️ **Catatan seed 3 bulan Bu Sari (selesai 11 Juli)** — `scripts/seed-bu-sari-3-months.ts` men-generate 917 transaksi baru (1 Apr–29 Jun 2026, 5–15 transaksi/hari, non-seragam) via pipeline Tier 1 yang sudah ada (insert `transactions` → `/api/classify`), ditambahkan di atas 9 transaksi lama + 4 dari mock-snap ingest (tidak dihapus). Total sekarang 930 transaksi, 1.860 `ledger_entries`, **balance** (`total_debit = total_kredit = Rp376.925.000`).
>
> **✅ KEPUTUSAN RESMI (12 Juli) — Growth = +18% total, bukan per bulan.** Definisi lama "+18%/bulan" di draft awal **digugurkan** — kalimat itu penulisan naratif yang longgar, bukan spesifikasi teknis yang diverifikasi. Kalau dikompon 3× per bulan, itu setara ~+42% total dalam 2 bulan — pertumbuhan yang terlalu agresif untuk warung nasi campur dan berisiko terlihat tidak realistis di depan juri ekonom BI. Angka final yang dipakai di paper & demo: **data seed murni (1 Apr–29 Jun, isolasi dari transaksi lama)**: April Rp96.005.000 → Juni(1-29) Rp113.279.000 = **+18,0% total**. Ini angka yang benar-benar dihasilkan & diverifikasi sistem — bukan target yang ditulis manual.
>
> *(Catatan tambahan, tidak dipakai sebagai acuan resmi: angka per kalender bulan versi sistem yang ikut membaurkan 1 transaksi lama tanggal 30 Juni menghasilkan +21,6% — perbedaan ini murni artefak pencampuran data lama+baru pada 1 hari, bukan sinyal yang berarti.)*

- **Pak Arief** — Analis Kredit Bank Jatim Cabang Surabaya. ⚠️ **Bukan UMKM kedua** — dia stakeholder sisi **bank/penilai**. Kondisi "sebelum": verifikasi manual 14–30 hari (kunjungan lapangan, cek fisik buku), 60% pengajuan ditolak karena bukti keuangan tidak cukup, bukan karena UMKM tak layak. Kondisi "sesudah": dia tinggal membuka laporan + skor yang sudah dihasilkan sistem dari data Bu Sari, lalu approve dalam ~3 hari. **Butuh view UI kedua** (lihat F6) yang mengonsumsi data yang sama dengan sisi Bu Sari — bukan data terpisah.

- **15–20 UMKM riil Jawa Timur** untuk reputation score (nama asli dari Google Maps, dikumpulkan Anggota B) — dataset pendukung F4, terpisah dari dua skenario demo di atas.
- Dataset publik sebagai proxy untuk benchmarking ACS (Kaggle Home Credit / LendingClub yang disesuaikan) + data sekunder BPS/BI Jatim.

---

## 6. Kepatuhan (ringkas — detail di paper)

- **UU PDP 27/2022**: consent management (`consent_records`), enkripsi, dan **DPIA wajib** (Pasal 34 — ACS masuk kategori high-risk). *Compliance-by-Design.*
- **POJK 29/2024**: posisikan sebagai konsumen output PKA berlisensi, bukan PKA.
- **SNAP BI**: reference architecture; PoC pakai mock API.