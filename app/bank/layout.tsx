import Link from 'next/link'

// Panel internal Bank Jatim — BUKAN halaman publik/marketing, jadi TIDAK
// pakai SiteHeader/SiteFooter dari route group (public). Framing eksplisit
// "instrumen internal 1 LJK mitra" (Pasal 56 POJK 29/2024, lihat PRD.md §6),
// bukan platform yang bisa diakses bank mana pun.
export default function BankLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-blue-950">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div>
            <p className="text-sm font-bold tracking-tight text-white">Bank Jatim</p>
            <p className="text-xs text-blue-300">Panel Internal Analis Kredit</p>
          </div>
          <Link
            href="/masuk"
            className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-semibold text-blue-100 transition-colors hover:bg-white/10"
          >
            Keluar
          </Link>
        </div>
      </header>

      <main className="flex-1 px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">{children}</div>
      </main>
    </div>
  )
}
