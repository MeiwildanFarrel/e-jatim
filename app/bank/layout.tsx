import Link from 'next/link'
// Reuse murni dari landing page — logo brand yang sama, bukan digambar ulang.
import { LogoMark } from '../(public)/_components/LogoMark'

// Panel internal Bank Jatim — BUKAN halaman publik/marketing, jadi TIDAK
// pakai SiteHeader/SiteFooter dari route group (public). Framing eksplisit
// "instrumen internal 1 LJK mitra" (Pasal 56 POJK 29/2024, lihat PRD.md §6),
// bukan platform yang bisa diakses bank mana pun. Nuansa "alat kerja
// profesional" (data density, tabel) — BUKAN treatment personal/motivational
// ala dashboard UMKM (lihat app/dashboard/page.tsx variant="hero").
export default function BankLayout({ children }: { children: React.ReactNode }) {
  return (
    // min-h-screen, bukan min-h-full — lihat catatan sama di app/dashboard/layout.tsx.
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="relative overflow-hidden border-b border-slate-200 bg-blue-950">
        {/* Tekstur titik halus — profesional, bukan dekoratif berlebihan */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '18px 18px' }}
        />
        <div className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7 shrink-0" />
            <div>
              <p className="text-sm font-bold tracking-tight text-white">Bank Jatim</p>
              <p className="text-xs text-blue-300">Panel Internal Analis Kredit</p>
            </div>
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
