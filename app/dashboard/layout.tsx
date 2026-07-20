import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { DashboardNav } from './_components/DashboardNav'
// Reuse murni dari landing page — logo brand yang sama, bukan digambar ulang.
import { LogoMark } from '../(public)/_components/LogoMark'

// Header identitas UMKM. `tone`: 'dark' untuk sidebar navy (desktop), 'light'
// untuk header mobile di atas latar putih. Header selalu menampilkan UMKM
// default (Bu Sari) — PoC single-tenant secara praktis (lihat catatan lama).
async function DashboardHeader({ tone }: { tone: 'dark' | 'light' }) {
  const { data: umkm } = await supabaseAdmin
    .from('umkm_profiles')
    .select('business_name')
    .eq('id', DEFAULT_UMKM_ID)
    .single()

  const isDark = tone === 'dark'

  return (
    <div className="flex items-center gap-2.5 px-4 py-3.5 sm:px-5">
      <LogoMark className="h-7 w-7 shrink-0" />
      <div className="min-w-0">
        <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {umkm?.business_name ?? 'Dashboard UMKM'}
        </p>
        <span
          className={`mt-0.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
            isDark ? 'bg-white/10 text-blue-100' : 'bg-blue-50 text-blue-900'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Terhubung dengan Bank Jatim
        </span>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // min-h-screen (bukan min-h-full): min-h-full bergantung rantai persentase
    // tinggi html->body->div, yang gagal resolve jadi tinggi definit kalau
    // body sendiri cuma punya min-height (bukan height eksplisit) — akibatnya
    // di halaman pendek (mis. Ajukan KUR tanpa pengajuan aktif), sidebar &
    // konten sama-sama "kepotong" sependek kontennya, tidak menyentuh dasar
    // viewport. min-h-screen (100vh) tidak bergantung rantai itu sama sekali.
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      {/* Sidebar navy — desktop (md ke atas). sticky top-0 h-screen: dipin ke
          viewport saat konten discroll (kalau tidak, aside cuma flex item
          biasa yang ikut ter-scroll bersama halaman di tab yang kontennya
          lebih tinggi dari layar, mis. Laporan Keuangan). overflow-y-auto
          jaga-jaga kalau suatu saat item nav bertambah lebih tinggi dari 100vh. */}
      <aside className="sticky top-0 hidden h-screen shrink-0 flex-col overflow-y-auto bg-blue-950 md:flex md:w-64">
        <div className="border-b border-white/10">
          <Suspense fallback={<div className="h-16" />}>
            <DashboardHeader tone="dark" />
          </Suspense>
        </div>
        <Suspense fallback={null}>
          <DashboardNav variant="sidebar" />
        </Suspense>
      </aside>

      <div className="flex flex-1 flex-col">
        {/* Header — mobile saja, sidebar sudah menampilkannya di desktop */}
        <header className="border-b border-slate-200 bg-white md:hidden">
          <Suspense fallback={<div className="h-16" />}>
            <DashboardHeader tone="light" />
          </Suspense>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-8 md:pt-8">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">{children}</div>
        </main>

        {/* Bottom nav — mobile saja */}
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
          <Suspense fallback={<div className="h-14" />}>
            <DashboardNav variant="bottom" />
          </Suspense>
        </nav>
      </div>
    </div>
  )
}
