import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tentang Proyek',
  description:
    'E-Jatim TrustLink adalah purwarupa riset untuk EJAVEC 2026 — mengubah data transaksi digital UMKM menjadi jejak kredit yang bisa dibaca bank.',
}

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-blue-900">Tentang proyek ini</h1>

      <div className="mt-8 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-slate-800">Apa itu E-Jatim TrustLink?</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            E-Jatim TrustLink adalah purwarupa (proof of concept) platform{' '}
            <em>financial middleware</em>: sistem perantara yang mengubah data
            transaksi digital UMKM — QRIS, e-wallet, marketplace — menjadi
            laporan keuangan berstandar SAK EMKM, skor kredit alternatif, dan
            skor reputasi usaha. Tujuannya satu: mengurangi asimetri informasi
            antara UMKM dan bank, supaya usaha yang sehat bisa membuktikan
            kelayakannya dan mengakses pembiayaan (KUR) lebih cepat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800">Konteks kompetisi</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Proyek ini disusun untuk <strong>East Java Economic Forum (EJAVEC) 2026</strong>,
            forum riset ekonomi yang diselenggarakan Bank Indonesia Kantor
            Perwakilan Jawa Timur bersama FEB Universitas Airlangga dan ISEI
            Surabaya. Kami mengambil <strong>Sub Tema 5</strong>: penguatan UMKM
            dan inklusi keuangan.
          </p>
          <p className="mt-3 leading-relaxed text-slate-600">
            Karena statusnya purwarupa riset, sebagian data yang tampil di demo
            adalah data simulasi (persona &ldquo;Bu Sari&rdquo;), dan integrasi
            ke sistem pembayaran menggunakan mock API bergaya standar SNAP
            Bank Indonesia — bukan koneksi produksi.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800">Tim</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Dikerjakan tim kecil lintas keahlian:
          </p>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span><strong>Anggota A — Tech Lead</strong>: arsitektur sistem, backend, mesin pembukuan otomatis, dan laporan keuangan.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span><strong>Anggota B — Data &amp; Machine Learning</strong>: model skor kredit alternatif dan analisis reputasi.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span><strong>Anggota C — Riset &amp; Penulisan</strong>: kajian ekonomi, kepatuhan regulasi, dan penulisan paper.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-base font-bold text-slate-800">Catatan penting</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            E-Jatim TrustLink bukan lembaga keuangan, bukan penyelenggara jasa
            pembayaran berizin, dan tidak memberikan keputusan kredit. Purwarupa
            ini dibuat untuk memvalidasi metodologi dan menjadi dasar rekomendasi
            kebijakan.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/kebijakan-privasi" className="font-semibold text-blue-900 underline underline-offset-2">
              Baca kebijakan privasi
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
