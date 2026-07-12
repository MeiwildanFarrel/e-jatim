import Link from 'next/link'
import { Reveal } from './_components/Reveal'
import { CountUp } from './_components/CountUp'
import { HeroVisual } from './_components/HeroVisual'
import { CtaIllustration } from './_components/CtaIllustration'
import { FaqItem } from './_components/FaqItem'

/* -------------------------------------------------------------------------
 * Landing page publik E-Jatim TrustLink.
 * Semua angka statistik bersumber dari PRD.md / proposal. Jangan menambah
 * angka baru tanpa sumber.
 * ---------------------------------------------------------------------- */

const stats = [
  {
    value: 2400,
    prefix: 'Rp',
    suffix: ' T',
    label: 'Credit gap UMKM Indonesia',
    detail: 'Kebutuhan pembiayaan UMKM yang belum terlayani lembaga keuangan formal.',
  },
  {
    value: 23,
    suffix: '%',
    label: 'UMKM dengan akses kredit formal',
    detail: 'Sebagian besar usaha kecil belum tersentuh pembiayaan perbankan.',
  },
  {
    value: 10,
    suffix: '%',
    label: 'Melek keuangan digital',
    detail: 'Pencatatan keuangan yang rapi masih jarang ditemui di lapangan.',
  },
  {
    value: 60,
    suffix: '%',
    label: 'Pengajuan kredit ditolak',
    detail: 'Ditolak karena bukti keuangannya tidak cukup, bukan karena usahanya tidak layak.',
  },
]

const steps = [
  {
    title: 'Beri izin sekali',
    desc: 'Anda memberi persetujuan agar data transaksi digital usaha Anda boleh dibaca sistem. Koneksinya memakai standar terbuka yang resmi seperti Open Banking, jadi Anda tidak perlu membagikan kata sandi apa pun. Tanpa izin Anda, tidak ada data yang diambil.',
  },
  {
    title: 'Pembukuan jalan sendiri',
    desc: 'Setiap transaksi otomatis tercatat dan dikelompokkan ke pos keuangan sesuai standar akuntansi UMKM (SAK EMKM). Anda tidak perlu mengetik ulang atau memahami istilah akuntansi.',
  },
  {
    title: 'Skor kredit terbentuk',
    desc: 'Dari catatan yang rapi, sistem menyusun laporan keuangan dan skor kredit alternatif. Inilah potret kesehatan usaha yang selama ini tidak terlihat oleh bank.',
  },
  {
    title: 'Ajukan KUR dengan bukti',
    desc: 'Laporan dan skor bisa Anda bagikan ke bank sebagai bukti kelayakan. Karena analis membaca data yang sudah rapi, verifikasi yang biasanya memakan 14 sampai 30 hari bisa dipangkas menjadi hitungan hari.',
  },
]

const features = [
  {
    title: 'Pembukuan Otomatis',
    benefit: 'Jualan seperti biasa, buku kas beres sendiri.',
    desc: 'Transaksi digital harian langsung menjadi catatan keuangan berstandar akuntansi UMKM. Tidak ada input manual dan tidak perlu latar belakang akuntansi.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-6 w-6 stroke-blue-900">
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 7.5h8M8 11h8M8 14.5h4" strokeLinecap="round" />
        <path d="m14.5 16.5 1.5 1.5 3-3" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-500" />
      </svg>
    ),
  },
  {
    title: 'Skor Kredit Alternatif',
    benefit: 'Kelayakan usaha yang akhirnya bisa dibuktikan.',
    desc: 'Pertumbuhan omzet, kestabilan arus kas, dan reputasi usaha diolah menjadi satu skor sederhana berwarna Hijau, Kuning, atau Merah yang mudah dibaca bank.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-6 w-6 stroke-blue-900">
        <path d="M4 17a8 8 0 0 1 16 0" strokeLinecap="round" />
        <path d="M12 17 15.5 11" strokeLinecap="round" className="stroke-emerald-500" />
        <circle cx="12" cy="17" r="1.6" className="fill-blue-900" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Skor Reputasi Usaha',
    benefit: 'Ulasan pelanggan ikut jadi modal.',
    desc: 'Penilaian pembeli di platform digital dianalisis menjadi skor reputasi. Ini melengkapi laporan keuangan dengan bukti bahwa usaha Anda dipercaya pelanggan.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-6 w-6 stroke-blue-900">
        <path d="M12 4.5 14 9l4.8.4-3.6 3.2 1.1 4.7L12 14.8l-4.3 2.5 1.1-4.7L5.2 9.4 10 9z" strokeLinejoin="round" />
        <circle cx="19" cy="5" r="2" className="fill-emerald-400" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Rapor Sehat Keuangan',
    benefit: 'Kebiasaan kecil, dampak besar.',
    desc: 'Tantangan 30 hari dan progres mingguan membantu Anda membangun disiplin keuangan sedikit demi sedikit, seperti rapor untuk kesehatan usaha.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" className="h-6 w-6 stroke-blue-900">
        <path d="M8 4h8a2 2 0 0 1 2 2v13a1 1 0 0 1-1.5.9L12 17.5 7.5 19.9A1 1 0 0 1 6 19V6a2 2 0 0 1 2-2Z" strokeLinejoin="round" />
        <path d="m9.5 10 1.8 1.8 3.2-3.3" strokeLinecap="round" strokeLinejoin="round" className="stroke-emerald-500" />
      </svg>
    ),
  },
]

const trustPoints = [
  {
    title: 'Berbasis izin, bukan diam-diam',
    desc: 'Data transaksi hanya diakses setelah Anda memberi persetujuan. Izin ini bisa Anda cabut kapan saja.',
  },
  {
    title: 'Data terenkripsi',
    desc: 'Data usaha Anda disimpan dalam bentuk terenkripsi dan hanya dipakai untuk menyusun laporan serta skor milik Anda sendiri.',
  },
  {
    title: 'Selaras UU PDP',
    desc: 'Dirancang mengikuti UU Pelindungan Data Pribadi No. 27 Tahun 2022 sejak awal, bukan ditambahkan belakangan.',
  },
]

const faqs = [
  {
    q: 'Apakah saya perlu punya sistem akuntansi atau pembukuan sendiri?',
    a: 'Tidak. Justru itu masalah yang kami selesaikan. Pembukuan disusun otomatis dari data transaksi digital yang sudah ada, seperti QRIS, e-wallet, dan marketplace. Anda cukup berjualan seperti biasa.',
  },
  {
    q: 'Amankah data transaksi saya?',
    a: 'Data hanya diambil setelah Anda memberi izin, disimpan terenkripsi, dan hanya dipakai untuk menyusun laporan serta skor usaha Anda. Anda bisa mencabut izin kapan saja sesuai UU Pelindungan Data Pribadi No. 27 Tahun 2022.',
  },
  {
    q: 'Bagaimana bank melihat laporan saya?',
    a: 'Bank tidak melihat transaksi mentah Anda satu per satu. Analis kredit membaca ringkasan yang sudah rapi, yaitu laporan keuangan standar (SAK EMKM), skor kredit alternatif, dan skor reputasi. Itu cukup untuk menilai kelayakan tanpa membongkar detail dapur usaha Anda.',
  },
  {
    q: 'Saya lebih banyak menerima uang tunai. Apakah tetap bisa pakai?',
    a: 'Skor paling akurat untuk transaksi digital. Transaksi tunai belum terekam otomatis pada tahap ini. Inilah salah satu alasan kami mendorong UMKM menerima pembayaran QRIS, karena setiap transaksi digital menjadi satu baris bukti kelayakan kredit.',
  },
  {
    q: 'Berapa biaya untuk memakai layanan ini?',
    a: 'Saat ini layanan gratis untuk digunakan. E-Jatim TrustLink dikembangkan untuk mendorong inklusi keuangan UMKM, bukan sebagai produk komersial.',
  },
  {
    q: 'Apakah skor ini menjamin pengajuan KUR saya disetujui?',
    a: 'Tidak. Keputusan kredit sepenuhnya ada di tangan bank. Yang kami pastikan adalah usaha Anda dinilai dari bukti yang lengkap dan rapi, bukan ditolak hanya karena tidak punya laporan keuangan.',
  },
]

export default function LandingPage() {
  return (
    <div className="overflow-x-clip">
      {/* ============================== HERO ============================== */}
      <section className="relative overflow-hidden bg-blue-950">
        {/* aksen latar: cahaya emerald lembut di pojok, asimetris */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-30%] left-[-10%] h-72 w-72 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-5xl gap-12 px-4 pb-24 pt-16 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-8 lg:pt-20">
          <div>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Jejak digital{' '}
              <span className="relative inline-block text-emerald-400">
                terpercaya
                <svg
                  viewBox="0 0 120 8"
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-2 w-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 6C30 2 90 2 118 5"
                    className="stroke-emerald-400"
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>{' '}
              untuk UMKM Jawa Timur
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-blue-100 sm:text-lg">
              Ubah data transaksi harian usaha Anda dari QRIS, e-wallet, dan
              marketplace menjadi laporan keuangan rapi dan skor kredit yang bisa
              dibaca bank. Tanpa pembukuan manual dan tanpa istilah rumit.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/masuk"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-emerald-400 px-6 text-base font-semibold text-blue-950 transition-colors hover:bg-emerald-300"
              >
                Masuk
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/25 px-6 text-base font-semibold text-white transition-colors hover:border-white/50 hover:bg-white/10"
              >
                Lihat cara kerjanya
              </a>
            </div>
          </div>

          {/* min-w-0: baris mono ber-truncate di HeroVisual punya min-content
              lebar; tanpa ini kolom grid ikut melar dan meng-clip teks di 360px */}
          <Reveal delayMs={100} className="min-w-0 pb-6 lg:pb-0">
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* ======================== MASALAH & DATA ========================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
              Bank bukan tak mau memberi kredit.
              <br className="hidden sm:block" /> UMKM yang tak bisa membuktikan layak.
            </h2>
            <p className="mt-4 leading-relaxed text-slate-500">
              Jutaan warung, kios, dan usaha rumahan bertransaksi digital setiap
              hari. Jejaknya nyata, tapi tidak pernah menjadi laporan keuangan
              yang bisa dibaca bank. Akibatnya muncul asimetri informasi, dan
              usaha yang sehat pun terlihat &ldquo;kosong&rdquo; di mata penilai
              kredit.
            </p>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {stats.map((s, i) => (
              <Reveal key={s.label} delayMs={i * 90}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md hover:shadow-slate-200/70">
                  <p className="text-3xl font-bold tracking-tight text-blue-900 sm:text-4xl">
                    <CountUp value={s.value} prefix={s.prefix ?? ''} suffix={s.suffix ?? ''} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">{s.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-500">{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={150}>
            <p className="mt-6 text-sm text-slate-400">
              Sumber: proposal riset E-Jatim TrustLink, diolah dari data Bank
              Indonesia, OJK, dan BPS.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =========================== CARA KERJA =========================== */}
      <section id="cara-kerja" className="scroll-mt-16 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Cara kerja
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
              Empat langkah dari warung ke KUR
            </h2>
            <p className="mt-4 leading-relaxed text-slate-500">
              Bayangkan Bu Sari, penjual nasi campur di Surabaya. Pembelinya
              sudah terbiasa membayar lewat QRIS, tapi ia tidak pernah sempat
              membukukan apa pun. Begini jalannya.
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delayMs={i * 110} className="h-full">
                <li className="relative h-full list-none rounded-2xl border border-slate-200 bg-white p-6">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-900 font-mono text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <h3 className="mt-4 text-base font-bold text-slate-800">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ======================== FITUR & MANFAAT ========================= */}
      <section id="fitur" className="scroll-mt-16 border-y border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Fitur &amp; manfaat
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
              Yang Anda dapatkan tanpa perlu jadi akuntan
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {features.map((f, i) => (
              <Reveal key={f.title} delayMs={i * 90} className="h-full">
                <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md hover:shadow-slate-200/70">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                    {f.icon}
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">{f.title}</h3>
                  <p className="mt-1 text-sm font-medium text-emerald-700">{f.benefit}</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== KEPERCAYAAN & KEPATUHAN ===================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Kepercayaan &amp; kepatuhan
            </p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
              Data Anda, izin Anda
            </h2>
          </Reveal>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {trustPoints.map((t, i) => (
              <Reveal key={t.title} delayMs={i * 100} className="h-full">
                <div className="flex h-full gap-3 rounded-2xl border border-slate-200 p-5">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="1.8"
                    aria-hidden="true"
                    className="mt-0.5 h-5 w-5 shrink-0 stroke-emerald-500"
                  >
                    <path
                      d="M12 3 5 6v5c0 4.5 3 8.2 7 10 4-1.8 7-5.5 7-10V6l-7-3Z"
                      strokeLinejoin="round"
                    />
                    <path d="m9 11.5 2.2 2.2L15.5 9" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{t.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-500">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delayMs={150}>
            <p className="mt-6 text-sm text-slate-400">
              Selengkapnya di{' '}
              <Link href="/kebijakan-privasi" className="font-medium text-blue-900 underline underline-offset-2">
                Kebijakan Privasi
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* ================================ FAQ ============================= */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-blue-900 sm:text-3xl">
              Pertanyaan yang sering muncul
            </h2>
          </Reveal>

          <div className="mt-8 space-y-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delayMs={i * 60}>
                <FaqItem question={f.q} answer={f.a} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== CTA PENUTUP =========================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          <Reveal>
            <div className="grid items-center gap-10 overflow-hidden rounded-3xl bg-blue-950 px-6 py-12 sm:px-10 lg:grid-cols-[1.1fr_1fr] lg:gap-6 lg:px-14">
              <div>
                <h2 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                  Transaksi hari ini,
                  <br />
                  <span className="text-emerald-400">kepercayaan</span> hari esok.
                </h2>
                <p className="mt-4 max-w-md leading-relaxed text-blue-200">
                  Setiap pembayaran digital yang Anda terima adalah satu baris
                  bukti bahwa usaha Anda layak. Mulai bangun jejak digital
                  terpercaya untuk usaha Anda hari ini.
                </p>
                <Link
                  href="/masuk"
                  className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-emerald-400 px-7 text-base font-semibold text-blue-950 transition-colors hover:bg-emerald-300"
                >
                  Mulai sekarang
                </Link>
                <p className="mt-3 text-sm text-blue-300">
                  Gratis digunakan. Tanpa kata sandi dan tanpa biaya tersembunyi.
                </p>
              </div>
              <div className="mx-auto w-full max-w-sm lg:mx-0">
                <CtaIllustration />
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
