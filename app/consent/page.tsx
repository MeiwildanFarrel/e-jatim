import type { Metadata } from 'next'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_UMKM_ID } from '@/lib/constants'
import { ConsentForm } from './ConsentForm'

export const metadata: Metadata = {
  title: 'Izinkan Akses',
  description: 'Berikan persetujuan akses data sebelum masuk ke laporan keuangan Anda.',
}

// Langkah baru di antara /masuk dan /dashboard (belum ada sebelum sesi ini).
// Halaman "app flow", bukan bagian dari route group (public) — tanpa navbar
// marketing, konsisten dengan /dashboard yang juga berdiri sendiri.
export default async function ConsentPage({
  searchParams,
}: {
  searchParams: Promise<{ umkm_id?: string }>
}) {
  const params = await searchParams
  const umkmId = params.umkm_id ?? DEFAULT_UMKM_ID

  const { data: umkm } = await supabaseAdmin
    .from('umkm_profiles')
    .select('business_name')
    .eq('id', umkmId)
    .single()

  const businessName = umkm?.business_name ?? 'usaha Anda'

  return (
    <div className="min-h-full bg-slate-50 px-4 py-10 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-xl">
        <Link href="/masuk" className="text-sm font-medium text-slate-500 hover:text-slate-700">
          ← Kembali
        </Link>

        <div className="mt-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">Izinkan Akses</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Sebelum masuk ke laporan keuangan <strong>{businessName}</strong>, kami perlu persetujuan Anda untuk
            memproses data. Kedua izin di bawah berdiri sendiri-sendiri.
          </p>
        </div>

        <div className="mt-8">
          <ConsentForm umkmId={umkmId} />
        </div>
      </div>
    </div>
  )
}
