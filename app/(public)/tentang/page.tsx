import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'E-Jatim TrustLink membantu UMKM Jawa Timur mengubah jejak transaksi digital menjadi bukti keuangan yang bisa dibaca bank.',
}

export default function TentangPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-blue-900">Tentang kami</h1>
      <p className="mt-4 text-lg leading-relaxed text-slate-600">
        E-Jatim TrustLink membantu usaha mikro dan kecil di Jawa Timur mengubah
        jejak transaksi digital mereka menjadi bukti keuangan yang bisa dipercaya
        bank.
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-lg font-bold text-slate-800">Masalah yang kami selesaikan</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Banyak UMKM yang sehat kesulitan mendapat kredit bukan karena
            usahanya tidak layak, melainkan karena mereka tidak punya laporan
            keuangan formal. Bank pun kesulitan menilai kelayakan tanpa data yang
            rapi. Kesenjangan informasi inilah yang membuat pembiayaan sulit
            mengalir ke usaha kecil.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800">Bagaimana kami membantu</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Kami menyusun pembukuan secara otomatis dari data transaksi digital
            yang sudah dimiliki UMKM, lalu mengubahnya menjadi laporan keuangan
            berstandar SAK EMKM, skor kredit alternatif, dan skor reputasi usaha.
            Dengan begitu, usaha yang sehat bisa membuktikan kelayakannya dan bank
            bisa mengambil keputusan lebih cepat.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-slate-800">Tim di baliknya</h2>
          <p className="mt-3 leading-relaxed text-slate-600">
            Kami tim kecil lintas keahlian yang menggabungkan rekayasa perangkat
            lunak, ilmu data, dan kajian ekonomi.
          </p>
          <ul className="mt-3 space-y-2 text-slate-600">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>Arsitektur sistem, backend, mesin pembukuan otomatis, dan laporan keuangan.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>Model skor kredit alternatif dan analisis reputasi berbasis data.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
              <span>Kajian ekonomi, kepatuhan regulasi, dan penulisan.</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-sm leading-relaxed text-slate-600">
            E-Jatim TrustLink adalah platform teknologi finansial dan bukan
            lembaga keuangan berizin. Kami tidak mengambil keputusan kredit dan
            belum memiliki kemitraan resmi dengan bank tertentu. Sistem dirancang
            agar sesuai dengan standar yang dibutuhkan lembaga keuangan formal.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/kebijakan-privasi" className="font-semibold text-blue-900 underline underline-offset-2">
              Baca kebijakan privasi
            </Link>
          </p>
        </section>

        <p className="text-sm leading-relaxed text-slate-400">
          Saat ini E-Jatim TrustLink berupa purwarupa yang dikembangkan untuk
          East Java Economic Forum (EJAVEC) 2026, sebuah forum kajian ekonomi di
          Jawa Timur, dengan fokus pada penguatan UMKM dan inklusi keuangan.
        </p>
      </div>
    </div>
  )
}
