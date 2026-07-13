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

### 2.5 — Halaman publik: landing page + pendukung — ✅ SELESAI & TERVERIFIKASI (12 Juli)
- [x] Route group `app/(public)/` dengan layout sendiri (SiteHeader + SiteFooter) — `app/page.tsx` boilerplate dihapus, dashboard TIDAK tersentuh (git diff `app/dashboard` + `src/` kosong, diverifikasi)
- [x] `/` landing page: Hero (visual "kartu ledger" orisinal HTML/CSS) → Masalah & Data (4 statistik count-up dari proposal: Rp2.400T credit gap, 23% akses kredit, 10% melek keuangan digital, 60% pengajuan ditolak) → Cara Kerja (4 langkah alur Bu Sari) → Fitur & Manfaat (F1/F3/F4/F5, framing manfaat non-teknis) → Kepercayaan & Kepatuhan (consent, enkripsi, UU PDP) → FAQ (5 pertanyaan spesifik proyek, `<details>` native) → CTA penutup kartu gelap `blue-950` + ilustrasi SVG orisinal (batang tumbuh + jembatan titik-garis) → Footer
- [x] `/tentang` (konteks EJAVEC 2026 + tim generik A/B/C), `/kebijakan-privasi` (ringkas, UU PDP 27/2022 Pasal 20 ayat 2 huruf a), `/masuk` (mock 2 kartu peran, tanpa password), `/bank` (placeholder F6 "sedang dibangun")
- [x] Animasi: `Reveal` (IntersectionObserver native, sekali jalan) + `CountUp` (rAF, nilai akhir selalu di markup SSR) — `prefers-reduced-motion` dihormati dua lapis (cek `matchMedia` di JS + override `@media` di `globals.css`, diverifikasi rule-nya tersaji di CSS ter-serve)
- [x] Mobile 360px: nol overflow horizontal di semua 5 halaman (diverifikasi programatis `scrollWidth`) — sempat ada bug kolom grid hero melar karena min-content baris `truncate`, diperbaiki dengan `min-w-0`
- [x] Konten: tanpa logo pihak ketiga (QRIS/e-wallet disebut sebagai teks), tanpa foto stok (semua visual SVG/CSS orisinal), semua angka dari PRD/proposal
- [x] `npm run build` lolos (16 route OK; catatan: `.next` perlu dihapus sekali karena types dev basi masih merujuk `app/page.tsx` lama)

> ⚠️ Catatan verifikasi: screenshot via Browser pane tidak bisa diambil sesi ini (tab pane berstatus `visibilityState: hidden` → renderer pause, rAF/IO/screenshot semua beku — keterbatasan lingkungan, bukan bug halaman). Verifikasi dilakukan via accessibility tree + pemeriksaan DOM/CSS programatis. **Farrel: lihat sendiri di browser sekali untuk cek rasa visual.**
>
> Keputusan desain kecil yang menyentuh file bersama (bukan dashboard, tapi global): `app/layout.tsx` — metadata situs + `lang="id"`; `app/globals.css` — font body Arial → Geist (menyamakan dengan klaim styling dashboard di §2.3) dan hapus flip dark-mode bawaan create-next-app (DESIGN.md: light default, dark pasca-PoC). Dashboard set warna/bg eksplisit sendiri, jadi tidak terpengaruh flip; efek satu-satunya: font dashboard kini Geist betulan.

### 2.6 — Revisi arah visual & copy (review Farrel) — ✅ SELESAI & TERVERIFIKASI (12 Juli)
Revisi versi pertama landing, bukan bangun ulang. Dashboard tetap tidak tersentuh (`git diff app/dashboard src` kosong, diverifikasi ulang).
- [x] **Hero & footer jadi gelap** (`bg-blue-950`) → bingkai gelap atas (hero) + bawah (CTA + footer), terang di tengah. Kartu ledger di hero tetap putih (efek "buku besar" di atas latar gelap). Kontras teks di latar gelap **diukur eksplisit** (bukan asumsi) via konversi warna computed → sRGB di canvas + hitung rasio WCAG: hero H1 14.65, sub-headline (`blue-100`) 12.01, tombol primer emerald 7.56, tombol sekunder 14.65, footer desc/link (`blue-200`) 10.3, footer heading/copyright (`blue-300`) 8.08 — **semua ≥ 4.5, lolos AA** (bahkan AAA).
- [x] **Hapus gaya "AI-coded" (strip/dash berlebih)** di seluruh copy (hero, masalah, cara kerja, fitur, kepercayaan, FAQ, CTA, footer, /tentang, /kebijakan-privasi, /masuk, /bank, metadata layout). Diverifikasi programatis: `fetch` tiap halaman → regex `[—–]` di HTML ter-render (comment di-strip) = **0 dash di kelima halaman**. En-dash "14–30 hari" diubah jadi "14 sampai 30 hari". Dash tersisa hanya di komentar kode `.tsx` (tidak ke HTML).
- [x] **Kurangi framing "PoC kompetisi"**: badge hero "Purwarupa riset · EJAVEC 2026" **dihapus** (hero fokus proposisi nilai). Penyebutan PoC/purwarupa/EJAVEC berulang dikurangi di landing/masuk/bank/kebijakan. Disclaimer legal **tetap ada tapi dihaluskan**: footer & /tentang kini "platform teknologi finansial yang bekerja sesuai standar lembaga keuangan formal, belum berizin, belum ada kemitraan bank resmi" — **tidak menyebut nama bank spesifik sebagai mitra**. `/tentang` ditulis ulang gaya produk (Masalah → Bagaimana kami membantu → Tim ringkas), konteks EJAVEC dipindah jadi 1 paragraf kecil `text-slate-400` di bawah.
- [x] **Navbar ditambah**: `[Logo] — Fitur, Cara Kerja, Tentang — [Masuk]`. "Fitur"/"Cara Kerja" = anchor ke section yang sudah ada (`/#fitur`, `/#cara-kerja`, awalan `/` agar jalan dari halaman lain); id `fitur` ditambahkan ke section Fitur. SiteHeader jadi client component + **hamburger menu di bawah `md`** (nav inline hidden). Diverifikasi 360px: hamburger tampil + nav inline hidden + Masuk tetap tampil; klik hamburger → `aria-expanded=true` + panel 3 link muncul; klik link → menu menutup. Desktop: nav inline 3 link tampil, hamburger hidden.
- [x] **Copy tambahan**: langkah 1 Cara Kerja kini menjelaskan akses data pakai "standar terbuka resmi seperti Open Banking, tanpa membagikan kata sandi"; FAQ baru "Berapa biaya…" (gratis, non-komersial); baris "Gratis digunakan. Tanpa kata sandi dan tanpa biaya tersembunyi." di bawah CTA utama.
- [x] **FAQ animasi smooth**: `<details>` native diganti komponen client `FaqItem.tsx` — `<button>` trigger + panel `<div>`, animasi CSS `grid-template-rows 0fr↔1fr` (child `overflow-hidden`), transisi 300ms ease-out, chevron rotate 0→180 durasi sama. Aksesibilitas: `aria-expanded` + `aria-controls`→id panel (`useId`). Diverifikasi via dispatch klik: `aria-expanded` flip false↔true, class panel `grid-rows-[0fr]`↔`grid-rows-[1fr]`, chevron `rotate-180` on/off, `transition-[grid-template-rows]` + `motion-reduce:transition-none` terpasang di panel & chevron. (Kehalusan visual transisi tak bisa di-screenshot karena renderer tab pane pause — mekanismenya terverifikasi via DOM/class.)
- [x] `npm run build` lolos (16 route OK).

> ⚠️ Keterbatasan verifikasi sama seperti §2.5: screenshot Browser pane tidak bisa diambil (tab `visibilityState: hidden` → renderer pause). Semua verifikasi via DOM/CSS/contrast programatis. **Farrel: buka sendiri di browser untuk cek rasa visual hero gelap + kehalusan animasi FAQ.**

---

## 🔜 MINGGU 3 (17–23 Juli) — Integrasi & Elemen Pembeda

Target resmi Anggota A: *"PoC end-to-end bisa didemokan dari input transaksi sampai skor kredit tampil."* Ini mencakup **dua** skenario Bab 3 — catatan penting soal Pak Arief di bawah.

### 3.0 — Consent Screen + Skor ACS dari Ledger Real + Speedometer — ✅ SELESAI & TERVERIFIKASI (13 Juli)
> ⚠️ **Keputusan tim (12-13 Juli) yang mengubah rencana awal 3.1**: model ML Anggota B **tidak dipakai** untuk skor runtime Bu Sari (dilatih di dataset publik, fitur tidak ada padanannya di ledger UMKM kita). Growth/Stability/Risk dihitung dari ledger real kita sendiri; Reputation tetap placeholder. Detail formula & bobot di PRD.md §F3.

- [x] **Layar consent baru** `app/consent/` (di antara `/masuk` dan `/dashboard`, gap yang sebelumnya belum ditutup) — 2 toggle independen (`transaction_data_access` wajib, `marketplace_review_access` opsional), default OFF, teks legal dari Anggota C di-render **persis** (diverifikasi programatis karakter-demi-karakter via `document.querySelectorAll('p')` dibanding string asli — cocok 100% untuk Toggle A, Toggle B, dan status SNAP BI). Link `/kebijakan-privasi` tampil di halaman yang sama. Server action `app/consent/actions.ts` menulis ke `consent_records` lalu memicu `saveCreditScore()`.
- [x] **3 syarat teknis toggle diverifikasi**: (1) default tidak tercentang — dicek programatis, keduanya `false`; (2) independen — diuji 3 kombinasi (A saja → tombol aktif; A+B → aktif; B saja tanpa A → tombol **disabled**, karena A wajib untuk fitur inti, tapi B tetap bisa nyala sendiri tanpa bergantung A); (3) link privasi ada di halaman yang sama — dikonfirmasi elemen `<a href="/kebijakan-privasi">` eksis di DOM consent.
- [x] **`src/lib/scoring/acsCalculator.ts`** (kalkulasi murni, tidak ada I/O) + **`creditScoreService.ts`** (fetch ledger + orkestrasi + simpan) — Growth/Stability/Risk dihitung dari `ledger_entries` real Bu Sari, HANYA bulan kalender yang sudah lengkap (bulan berjalan dikeluarkan supaya tidak bias oleh hari parsial). Reputation (placeholder 50) hanya diikutkan kalau `consent_records.marketplace_review_access.granted = true`; kalau tidak, komponen dikeluarkan dan bobotnya didistribusikan ulang proporsional ke 3 komponen lain (bukan dihukum jadi 0 — supaya user yang memilih privasi tidak otomatis kena skor lebih rendah).
- [x] Endpoint manual `app/api/scoring/calculate/route.ts` (POST) untuk re-run verifikasi tanpa lewat UI.
- [x] `app/dashboard/_components/SpeedometerCard.tsx` — gauge SVG setengah lingkaran 3 pita warna (Hijau ≥70/Kuning 40-69/Merah <40, threshold sama persis dengan `scoreCategoryOf()` lewat `SCORE_THRESHOLDS` — satu sumber kebenaran), breakdown 4 komponen, disclaimer Pasal 32 ayat (4) POJK 29/2024 **persis**. Data dibaca dari `credit_scores` (bukan hardcode) via `getCreditScore()`.
- [x] **Verifikasi end-to-end 2 skenario** (dev server, klik toggle sungguhan lewat dispatch event, bukan cuma baca kode): (a) Toggle A saja → skor **58/100 Kuning** (Growth 71.6, Stability 91.9, Risk 9.5, Reputation "Belum aktif"); (b) Toggle A+B → skor **56/100 Kuning** (Reputation=50 ikut dihitung). Kedua angka dicocokkan manual dengan formula (weights redistribution utk kasus a) — **cocok persis** sampai satu desimal. `credit_scores` terkonfirmasi diganti (baris dummy `v0.1-dummy` hilang, baris baru `v0.5-ledger-partial`). `consent_records` terkonfirmasi terisi dengan `consent_type` persis sesuai skema.
- [x] Trial balance **tidak berubah** sebelum/sesudah alur (Rp380.345.000 = Rp380.345.000, `is_balance: true`, dicek via `/api/reports/trial-balance` sebelum & sesudah) — scoring hanya membaca `ledger_entries`, tidak menulis ke sana.
- [x] Mobile 360px: `/consent` dan `/dashboard` (dengan speedometer baru) nol overflow horizontal.
- [x] `npm run build` lolos (18 route: + `/consent`, `/api/scoring/calculate`).
- [x] `git diff` `src/lib/reports`, `src/lib/classifier`, dan 3 card dashboard lama (`IncomeStatementCard`/`BalanceSheetCard`/`NotesCard`) — **kosong**, tidak tersentuh.

> **Bobot w1-w4 TENTATIF** (belum ada rujukan dari Anggota B): Growth 0.35, Stability 0.25, Reputation 0.20, Risk 0.20. Rasional lengkap ada di komentar `acsCalculator.ts` dan laporan sesi.
>
> **📌 Status file Anggota B (`best_model.pkl` dkk) masih ditunggu** — BUKAN blocker untuk item di atas (keputusan tim: model itu tidak dipakai untuk skor runtime, hanya jadi bukti metodologi benchmarking di paper). Kalau file itu akhirnya diserahkan, cek dulu apakah fitur yang dipakai match dengan skema ledger kita sebelum dipertimbangkan untuk dipakai — jangan diintegrasikan langsung tanpa audit fitur.
>
> ⚠️ Modul gamifikasi (progres tantangan 30 hari + `gamification_progress`) **belum dikerjakan sesi ini** — di luar scope Bagian 1-3 yang diminta, masih backlog.

### 3.2 — Alur sisi Bank (skenario Pak Arief) — **KOREKSI dari catatan sebelumnya + koreksi framing 13 Juli**
> ⚠️ Pak Arief **bukan** UMKM kedua yang perlu di-seed terpisah — dia Analis Kredit Bank Jatim di Bab 3. Skenarionya: dia melihat laporan+skor yang sudah dihasilkan dari data UMKM (Bu Sari), lalu approve dalam hitungan hari (bukan 14-30 hari manual). Yang perlu dibangun bukan data baru, tapi **sudut pandang UI kedua** dari data yang sama:
>
> **📌 Update 13 Juli (keputusan tim Pasal 56 POJK 29/2024, lihat PRD.md §6)**: framing lama "middleware integrator yang mengonsumsi output PKA berlisensi" **dibatalkan**. Pak Arief sekarang di-framing sebagai **user INTERNAL Bank Jatim** yang memakai alat internal (bukan pihak luar independen menerima laporan dari platform umum) — ini murni perubahan narasi/framing untuk paper, **tidak mengubah scope teknis** item di bawah (masih belum dikerjakan, masih backlog Minggu 3).

- [ ] Halaman/view sederhana sisi "Analis Kredit": buka profil UMKM → lihat 3 laporan + skor ACS (kini dari ledger real, lihat 3.0) + Reputation Score
- [ ] Aksi approve/reject yang mengubah `status` di `loan_applications` (draft/submitted → approved/rejected) — pakai `created_at`→`reviewed_at` (⚠️ bukan `submitted_at`/`decided_at`, kolom itu tidak eksis — lihat PRD.md §4.1) untuk simulasi "3 hari" (kontras ke 14-30 hari manual di narasi)
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