import Link from 'next/link'
import { LogoMark } from './LogoMark'

export const SiteFooter = () => (
  <footer className="bg-blue-950 text-blue-100">
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LogoMark className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-tight text-white">
            E-Jatim <span className="text-emerald-400">TrustLink</span>
          </span>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-blue-200">
          Jembatan kepercayaan antara jejak transaksi digital UMKM dan penilaian
          kredit perbankan.
        </p>
      </div>

      <nav className="space-y-3" aria-label="Tautan situs">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Navigasi</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/#fitur" className="text-blue-200 transition-colors hover:text-white">
              Fitur
            </Link>
          </li>
          <li>
            <Link href="/#cara-kerja" className="text-blue-200 transition-colors hover:text-white">
              Cara kerja
            </Link>
          </li>
          <li>
            <Link href="/tentang" className="text-blue-200 transition-colors hover:text-white">
              Tentang kami
            </Link>
          </li>
          <li>
            <Link href="/kebijakan-privasi" className="text-blue-200 transition-colors hover:text-white">
              Kebijakan privasi
            </Link>
          </li>
        </ul>
      </nav>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300">Kontak</p>
        <ul className="space-y-2 text-sm text-blue-200">
          <li>halo@ejatim-trustlink.example (placeholder)</li>
          <li>Surabaya, Jawa Timur</li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10">
      <p className="mx-auto max-w-5xl px-4 py-4 text-xs leading-relaxed text-blue-300 sm:px-8">
        © 2026 E-Jatim TrustLink. Platform teknologi finansial yang bekerja
        sesuai standar yang dibutuhkan lembaga keuangan formal. Kami belum
        berstatus lembaga keuangan berizin dan belum memiliki kemitraan resmi
        dengan bank tertentu.
      </p>
    </div>
  </footer>
)
