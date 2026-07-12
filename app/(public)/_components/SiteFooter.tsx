import Link from 'next/link'
import { LogoMark } from './LogoMark'

export const SiteFooter = () => (
  <footer className="border-t border-slate-200 bg-slate-50">
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LogoMark className="h-6 w-6" />
          <span className="text-sm font-semibold tracking-tight text-blue-900">
            E-Jatim <span className="text-emerald-600">TrustLink</span>
          </span>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
          Jembatan kepercayaan antara jejak transaksi digital UMKM dan penilaian
          kredit perbankan. Purwarupa (PoC) untuk EJAVEC 2026.
        </p>
      </div>

      <nav className="space-y-3" aria-label="Tautan situs">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Navigasi</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link href="/tentang" className="text-slate-600 transition-colors hover:text-blue-900">
              Tentang proyek
            </Link>
          </li>
          <li>
            <Link href="/kebijakan-privasi" className="text-slate-600 transition-colors hover:text-blue-900">
              Kebijakan privasi
            </Link>
          </li>
          <li>
            <Link href="/masuk" className="text-slate-600 transition-colors hover:text-blue-900">
              Masuk
            </Link>
          </li>
        </ul>
      </nav>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Kontak</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>halo@ejatim-trustlink.example (placeholder)</li>
          <li>Surabaya, Jawa Timur</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-slate-200">
      <p className="mx-auto max-w-5xl px-4 py-4 text-xs text-slate-400 sm:px-8">
        © 2026 Tim E-Jatim TrustLink — purwarupa non-komersial untuk East Java
        Economic Forum (EJAVEC) 2026. Bukan layanan keuangan berizin.
      </p>
    </div>
  </footer>
)
