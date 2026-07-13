import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Masuk',
  description: 'Pilih peran untuk mencoba E-Jatim TrustLink sebagai UMKM atau sebagai Analis Kredit Bank.',
}

/*
 * Halaman masuk mock (keputusan PoC): tanpa form password, cukup pilih peran.
 * - UMKM → /consent (layar izin akses, baru Minggu 3) → /dashboard
 * - Bank → /bank (placeholder; dashboard analis kredit = F6, belum dibangun)
 */
export default function MasukPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col px-4 py-16 sm:px-8 sm:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-blue-900">Masuk</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Pilih peran untuk melihat sistem dari dua sisi. Tidak perlu kata sandi.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/consent"
          className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-100 sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
            {/* ikon warung/toko (garis orisinal) */}
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6 stroke-emerald-600">
              <path d="M4 9.5 5.5 4h13L20 9.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0" strokeLinecap="round" />
              <path d="M5.5 12v8h13v-8M10 20v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">Masuk sebagai UMKM</h2>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">
            Lihat laporan keuangan yang tersusun otomatis dari transaksi harian,
            dari sudut pandang pemilik usaha seperti Bu Sari.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-600">
            Buka dashboard UMKM
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
          </span>
        </Link>

        <Link
          href="/bank"
          className="group flex flex-col rounded-2xl border-2 border-slate-200 bg-white p-6 transition-all hover:border-blue-900 hover:shadow-lg hover:shadow-blue-100 sm:p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
            {/* ikon gedung berpilar (garis orisinal) */}
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-6 w-6 stroke-blue-900">
              <path d="m12 3 8 4.5H4L12 3Z" strokeLinejoin="round" />
              <path d="M5.5 10v7M9.8 10v7M14.2 10v7M18.5 10v7" strokeLinecap="round" />
              <path d="M4 20h16" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-800">Masuk sebagai Bank</h2>
          <p className="mt-1 flex-1 text-sm leading-relaxed text-slate-500">
            Sudut pandang analis kredit: membaca laporan dan skor UMKM untuk
            keputusan pembiayaan yang lebih cepat.
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-900">
            Buka tampilan analis
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
          </span>
        </Link>
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Mode demo. Tidak ada autentikasi sungguhan dan tidak ada data pribadi
        yang diminta di halaman ini.
      </p>
    </div>
  )
}
