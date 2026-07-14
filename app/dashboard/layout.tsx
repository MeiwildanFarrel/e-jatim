import { Suspense } from 'react'
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { DashboardNav } from './_components/DashboardNav'

// Header selalu menampilkan identitas UMKM default (Bu Sari) — PoC ini
// single-tenant secara praktis (satu-satunya UMKM dengan data nyata).
// Halaman per-tab tetap menghormati `?umkm_id=` sendiri-sendiri seperti
// sebelumnya; layout Next.js App Router tidak menerima `searchParams`
// (supaya layout tidak re-render tiap ganti query), jadi header ini
// sengaja tidak ikut membaca override tersebut.
async function DashboardHeader() {
  const { data: umkm } = await supabaseAdmin
    .from('umkm_profiles')
    .select('business_name')
    .eq('id', DEFAULT_UMKM_ID)
    .single()

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">{umkm?.business_name ?? 'Dashboard UMKM'}</p>
        <span className="mt-0.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-900">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Terhubung dengan Bank Jatim
        </span>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-slate-50 md:flex-row">
      {/* Sidebar — desktop (md ke atas) */}
      <aside className="hidden shrink-0 border-r border-slate-200 bg-white md:flex md:w-64 md:flex-col">
        <div className="border-b border-slate-100">
          <Suspense fallback={<div className="h-16" />}>
            <DashboardHeader />
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
            <DashboardHeader />
          </Suspense>
        </header>

        <main className="flex-1 px-4 py-6 pb-24 sm:px-6 md:pb-6">
          <div className="mx-auto flex max-w-4xl flex-col gap-6">{children}</div>
        </main>

        {/* Bottom nav — mobile saja */}
        <nav className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white md:hidden">
          <Suspense fallback={<div className="h-14" />}>
            <DashboardNav variant="bottom" />
          </Suspense>
        </nav>
      </div>
    </div>
  )
}
