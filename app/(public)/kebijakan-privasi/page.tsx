import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kebijakan Privasi',
  description:
    'Ringkasan kebijakan privasi purwarupa E-Jatim TrustLink: data apa yang diproses, dasar hukumnya, dan hak Anda.',
}

const sections = [
  {
    title: 'Data apa yang kami proses?',
    body: [
      'Data transaksi digital usaha Anda (nominal, tanggal, deskripsi, dan sumber transaksi seperti QRIS/e-wallet/marketplace) — hanya setelah Anda memberikan persetujuan eksplisit.',
      'Data profil usaha dasar: nama usaha, nama pemilik, kategori usaha, dan kota/provinsi.',
      'Ulasan publik pelanggan terhadap usaha Anda di platform digital, untuk menyusun skor reputasi.',
    ],
  },
  {
    title: 'Dasar hukum pemrosesan',
    body: [
      'Pemrosesan dilakukan berdasarkan persetujuan (consent) eksplisit Anda, sesuai Pasal 20 ayat (2) huruf a UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).',
      'Kami tidak memakai dalih "kepentingan sah" (legitimate interest) untuk mengambil data transaksi Anda — tanpa persetujuan, tidak ada data yang diproses.',
      'Setiap persetujuan dicatat (jenis, waktu diberikan, waktu dicabut) sebagai jejak audit.',
    ],
  },
  {
    title: 'Untuk apa data dipakai?',
    body: [
      'Menyusun pembukuan otomatis dan laporan keuangan usaha Anda (standar SAK EMKM).',
      'Menghitung skor kredit alternatif dan skor reputasi usaha Anda.',
      'Data Anda tidak dijual dan tidak dibagikan ke pihak lain — laporan dan skor hanya diteruskan ke bank apabila Anda sendiri yang mengajukan pembiayaan.',
    ],
  },
  {
    title: 'Hak Anda sebagai pemilik data',
    body: [
      'Mengakses dan melihat data serta laporan yang dihasilkan dari data Anda.',
      'Meminta perbaikan data yang keliru.',
      'Mencabut persetujuan kapan saja — pemrosesan data baru berhenti sejak pencabutan.',
      'Meminta penghapusan data Anda dari sistem.',
    ],
  },
  {
    title: 'Keamanan',
    body: [
      'Data disimpan terenkripsi dan akses antar-pengguna dibatasi di tingkat baris database (setiap UMKM hanya bisa mengakses datanya sendiri).',
      'Pemrosesan skor kredit kami perlakukan sebagai pemrosesan berisiko tinggi, dengan penilaian dampak pelindungan data (DPIA) sebagaimana diatur Pasal 34 UU PDP.',
    ],
  },
]

export default function KebijakanPrivasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-8 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight text-blue-900">Kebijakan Privasi</h1>
      <p className="mt-3 leading-relaxed text-slate-500">
        Ringkasan cara purwarupa E-Jatim TrustLink memperlakukan data — ditulis
        singkat supaya benar-benar terbaca, bukan disembunyikan di balik bahasa
        hukum.
      </p>

      <div className="mt-10 space-y-8">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-bold text-slate-800">{s.title}</h2>
            <ul className="mt-3 space-y-2">
              {s.body.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-slate-600">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm leading-relaxed text-slate-500">
        Dokumen ini adalah ringkasan representatif untuk purwarupa riset
        (EJAVEC 2026), bukan dokumen legal final. Data yang dipakai dalam demo
        adalah data simulasi. Pertanyaan: halo@ejatim-trustlink.example
        (placeholder). Pembaruan terakhir: Juli 2026.
      </p>
    </div>
  )
}
