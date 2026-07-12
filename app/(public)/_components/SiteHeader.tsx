'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogoMark } from './LogoMark'

// Anchor memakai awalan "/" agar tetap berfungsi saat diklik dari halaman
// lain (mis. /tentang): browser pindah ke beranda lalu scroll ke section.
const navLinks = [
  { label: 'Fitur', href: '/#fitur' },
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'Tentang', href: '/tentang' },
]

export const SiteHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2"
          aria-label="E-Jatim TrustLink, beranda"
          onClick={() => setMenuOpen(false)}
        >
          <LogoMark className="h-6 w-6 shrink-0" />
          <span className="truncate text-sm font-semibold tracking-tight text-blue-900">
            E-Jatim <span className="text-emerald-600">TrustLink</span>
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {/* Nav inline untuk layar sedang ke atas */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi utama">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/masuk"
            className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-800"
          >
            Masuk
          </Link>

          {/* Tombol hamburger hanya di bawah breakpoint md */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-mobile"
            aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-slate-100 md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" aria-hidden="true" className="h-5 w-5 stroke-current">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Panel menu mobile: muncul saat hamburger aktif, tertutup saat link diklik */}
      {menuOpen && (
        <nav
          id="menu-mobile"
          aria-label="Navigasi mobile"
          className="border-t border-slate-200 bg-white md:hidden"
        >
          <ul className="mx-auto flex max-w-5xl flex-col px-4 py-2 sm:px-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
