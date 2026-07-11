# DESIGN.md — Panduan Visual & UI/UX (E-Jatim TrustLink)

> **Status:** frontend belum dibangun (repo saat ini backend/API-first). Dokumen ini bersifat **panduan ke depan** — kontrak visual yang dipakai saat UI mulai dibuat, supaya konsisten sejak awal.

---

## 1. Framework Styling

- **Tailwind CSS** (utility-first) — terkunci.
- Belum pakai component library. **Rekomendasi:** adopsi **shadcn/ui** saat mulai membangun UI (komponen headless + Tailwind, konsisten, cepat). Kalau tidak, cukup komponen Tailwind custom yang di-*reuse*.
- Hindari CSS Modules / styled-components untuk menjaga satu sumber styling.

---

## 2. Prinsip Desain

Pengguna akhir = **UMKM** (mis. Bu Sari), sering **awam finansial & buka dari HP**. Maka:

- **Mobile-first, wajib.** Desktop = enhancement, bukan sebaliknya.
- **Jelas > cantik.** Angka keuangan & skor harus terbaca cepat, minim jargon.
- **Satu aksi utama per layar.** Kurangi beban kognitif.
- **Bahasa Indonesia sehari-hari** di UI (bukan istilah akuntansi berat). Mis. "Uang Masuk" bukan "Kas Debit".

---

## 3. Tema Warna

### Mode
- **Light mode sebagai default** (audiens UMKM & demo juri lebih ramah light). Dark mode = opsional pasca-PoC.

### Palet Skor (semantik — WAJIB konsisten dengan gamifikasi & ACS)
Speedometer Rapor Sehat memakai 3 status; pakai token yang sama di seluruh app:

| Status | Makna | Warna acuan (Tailwind) |
|---|---|---|
| 🟢 Hijau | Sehat / layak kredit | `emerald-500` (`#10b981`) |
| 🟡 Kuning | Perlu perhatian | `amber-500` (`#f59e0b`) |
| 🔴 Merah | Berisiko | `red-500` (`#ef4444`) |

### Palet Brand / UI
Selaras dengan identitas dokumen tim (navy sebagai warna institusional):

| Peran | Warna acuan |
|---|---|
| Primary (brand, header, CTA) | Navy / `blue-900` (`#1e3a8a`) |
| Sekunder / aksen | `blue-600` (`#2563eb`) |
| Latar | `white` / `slate-50` |
| Teks utama | `slate-800` |
| Teks sekunder | `slate-500` |
| Garis/border | `slate-200` |

> Konsistensikan warna status skor di UI dengan warna status di laporan/dokumen tim (navy/merah/amber/hijau) supaya demo terlihat satu kesatuan.

---

## 4. Tipografi

- **Font UI:** **Inter** (via `next/font`, gratis, terbaca di angka & layar kecil). Alternatif: Geist (bawaan Next.js).
- **Angka finansial:** gunakan varian *tabular-nums* agar kolom angka rata.
- **Skala:** heading `text-2xl`/`text-xl` → body `text-base` → caption `text-sm`. Jangan lebih dari 3–4 tingkat.
- Format Rupiah konsisten: `Rp20.750.000` (pemisah ribuan titik, tanpa desimal untuk nominal besar).

---

## 5. Layout & Komponen

- **Kontainer**: `max-w-md` (mobile-centric) untuk view UMKM; `max-w-5xl` untuk view dashboard/laporan.
- **Kartu (card)** sebagai unit utama: laporan, skor, progress → satu kartu satu informasi.
- **Speedometer/gauge** sebagai hero di dashboard UMKM (skor kredit + band warna).
- **Tabel laporan** (mis. Neraca Saldo): sticky header, angka rata kanan, baris total tebal, indikator balance/tidak balance.
- Spacing pakai skala Tailwind (`p-4`, `gap-4`), konsisten; hindari nilai arbitrer.

---

## 6. Responsivitas

- Breakpoint Tailwind standar: `sm 640` / `md 768` / `lg 1024`.
- Uji minimal di lebar **360px** (HP low-end umum di segmen UMKM).
- Tabel lebar → *horizontal scroll* di mobile, bukan dipaksa mengecil sampai tak terbaca.
- Target sentuh ≥ 44px; tombol utama full-width di mobile.

---

## 7. Aksesibilitas (minimal, tapi jangan diabaikan)

- Kontras teks memenuhi WCAG AA (khusus angka & status skor).
- Jangan mengandalkan **warna saja** untuk status: sertakan label ("Sehat"/"Berisiko") atau ikon, karena band Hijau/Kuning/Merah harus tetap terbaca oleh yang buta warna.
- Setiap input punya label; fokus keyboard terlihat.

---

## 8. Catatan untuk Demo Juri (EJAVEC)

Juri = ekonom BI, bukan engineer. Prioritas visual saat demo:
1. **Alur nilai** yang kelihatan: transaksi mentah → laporan rapi → skor → "layak KUR".
2. **Speedometer skor** sebagai *moment* utama (mudah dicerna non-teknis).
3. Bahasa & angka yang bisa dibaca 3 detik, bukan dashboard penuh metrik teknis.
