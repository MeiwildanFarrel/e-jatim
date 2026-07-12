import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tampilan Analis Bank',
  description: 'Tampilan analis kredit E-Jatim TrustLink sedang dibangun.',
}

/* Placeholder F6 (alur verifikasi sisi bank) — dashboard analis lengkap
 * dibangun di tugas terpisah (Minggu 3), bukan sesi ini. */
export default function BankPlaceholderPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center sm:px-8 sm:py-28">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-7 w-7 stroke-blue-900">
          <path d="M14 4h-4a1 1 0 0 0-1 1v1.2a6.8 6.8 0 0 0 0 11.6V19a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-1.2a6.8 6.8 0 0 0 0-11.6V5a1 1 0 0 0-1-1Z" strokeLinejoin="round" />
          <path d="M12 9v3l2 2" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-500" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
        Fitur ini sedang dibangun
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-slate-500">
        Tampilan analis kredit untuk membaca laporan keuangan, skor kredit
        alternatif, dan skor reputasi UMKM, lalu memberi keputusan. Bagian ini
        sedang kami siapkan.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/masuk"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Kembali ke pilihan peran
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-blue-900 px-5 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Ke beranda
        </Link>
      </div>
    </div>
  )
}
