'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_ITEMS = [
  {
    href: '',
    label: 'Ringkasan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <path d="M4 11 12 4l8 7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 10v9h12v-9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/laporan',
    label: 'Laporan Keuangan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/skor',
    label: 'Skor Kredit',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <path d="M4 17a8 8 0 0 1 16 0" strokeLinecap="round" />
        <path d="M12 17 15.5 11" strokeLinecap="round" />
        <circle cx="12" cy="17" r="1.4" />
      </svg>
    ),
  },
  {
    href: '/progres',
    label: 'Streak',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <path
          d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: '/ajukan-kur',
    label: 'Ajukan KUR',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5">
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <circle cx="12" cy="13" r="2.5" />
        <path d="M3 10h2M19 10h2" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function DashboardNav({ variant }: { variant: 'sidebar' | 'bottom' }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const umkmId = searchParams.get('umkm_id')

  const items = NAV_ITEMS.map((item) => {
    const fullHref = `/dashboard${item.href}`
    const href = umkmId ? `${fullHref}?umkm_id=${umkmId}` : fullHref
    const isActive = pathname === fullHref
    return { ...item, href, isActive }
  })

  if (variant === 'sidebar') {
    return (
      <>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navigasi dashboard">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                item.isActive ? 'bg-blue-50 text-blue-900' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
              aria-current={item.isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5 stroke-current">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Keluar
          </Link>
        </div>
      </>
    )
  }

  return (
    <nav className="flex items-stretch justify-around" aria-label="Navigasi dashboard">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium ${
            item.isActive ? 'text-blue-900' : 'text-slate-500'
          }`}
          aria-current={item.isActive ? 'page' : undefined}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
      <Link
        href="/"
        className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium text-slate-500 hover:text-red-600"
      >
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5 stroke-current">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
        </svg>
        <span className="truncate">Keluar</span>
      </Link>
    </nav>
  )
}
