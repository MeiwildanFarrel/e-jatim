import Link from 'next/link'
import { LogoMark } from './LogoMark'

export const SiteHeader = () => (
  <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
    <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
      <Link href="/" className="flex min-w-0 items-center gap-2" aria-label="E-Jatim TrustLink — beranda">
        <LogoMark className="h-6 w-6 shrink-0" />
        <span className="truncate text-sm font-semibold tracking-tight text-blue-900">
          E-Jatim <span className="text-emerald-600">TrustLink</span>
        </span>
      </Link>
      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Navigasi utama">
        <Link
          href="/tentang"
          className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          Tentang
        </Link>
        <Link
          href="/masuk"
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
        >
          Masuk
        </Link>
      </nav>
    </div>
  </header>
)
