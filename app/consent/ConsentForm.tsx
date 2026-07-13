'use client'

import { useState } from 'react'
import Link from 'next/link'
import { submitConsent } from './actions'

// Teks Toggle A, Toggle B, dan status SNAP BI di bawah adalah teks hukum
// final dari Anggota C — render PERSIS, jangan diparafrase atau dipersingkat.
const TRANSACTION_CONSENT_TEXT =
  'Saya memberikan persetujuan kepada E-Jatim TrustLink untuk mengakses dan memproses data transaksi digital usaha saya dari kanal QRIS, dompet elektronik, dan marketplace. Tujuan pemrosesan: menyusun laporan keuangan sesuai format SAK EMKM dan menghitung skor kredit alternatif. Data yang diproses meliputi tanggal, nominal, deskripsi, dan kanal transaksi. Data disimpan selama akun saya aktif dan dihapus paling lama 30 hari setelah persetujuan ini saya cabut. Saya dapat menarik persetujuan ini kapan saja melalui menu Pengaturan, tanpa memengaruhi keabsahan pemrosesan yang telah dilakukan sebelum pencabutan.'

const MARKETPLACE_CONSENT_TEXT =
  'Saya memberikan persetujuan kepada E-Jatim TrustLink untuk mengambil dan menganalisis ulasan publik atas usaha saya di platform marketplace dan peta digital. Tujuan pemrosesan: menghitung komponen Skor Reputasi dalam penilaian kredit alternatif. Analisis dilakukan atas teks ulasan dan rating, tanpa mengambil identitas pribadi pemberi ulasan. Saya dapat menarik persetujuan ini kapan saja; pencabutan akan menghentikan pembaruan Skor Reputasi saya.'

const SNAP_STATUS_TEXT =
  'Prototipe ini menggunakan API tiruan yang mengacu pada struktur Standar Nasional Open API Pembayaran (SNAP) Bank Indonesia. Sistem belum terhubung ke lingkungan produksi Penyedia Jasa Pembayaran berlisensi; integrasi produksi memerlukan perjanjian kerja sama dengan PJP sebagaimana disyaratkan PADG No. 23/15/PADG/2021.'

function ToggleSwitch({
  checked,
  onChange,
  name,
  label,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  name: string
  label: string
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className="relative inline-flex h-7 w-12 shrink-0 items-center">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-slate-300 transition-colors peer-checked:bg-emerald-500" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
      <span className="text-sm font-semibold text-slate-800">{label}</span>
    </label>
  )
}

export function ConsentForm({ umkmId }: { umkmId: string }) {
  const [transactionAccess, setTransactionAccess] = useState(false)
  const [marketplaceAccess, setMarketplaceAccess] = useState(false)

  return (
    <form action={submitConsent} className="space-y-4">
      <input type="hidden" name="umkm_id" value={umkmId} />

      {/* Toggle A — wajib untuk fitur inti (laporan keuangan + skor kredit) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Akses Data Transaksi</h2>
            <p className="mt-0.5 text-xs font-medium text-emerald-600">Wajib untuk laporan keuangan &amp; skor kredit</p>
          </div>
          <ToggleSwitch
            name="transaction_data_access"
            checked={transactionAccess}
            onChange={setTransactionAccess}
            label=""
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{TRANSACTION_CONSENT_TEXT}</p>

        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500">{SNAP_STATUS_TEXT}</p>
      </div>

      {/* Toggle B — opsional, hanya mempengaruhi komponen Skor Reputasi */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">Akses Ulasan Marketplace</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-400">Opsional — untuk Skor Reputasi</p>
          </div>
          <ToggleSwitch
            name="marketplace_review_access"
            checked={marketplaceAccess}
            onChange={setMarketplaceAccess}
            label=""
          />
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">{MARKETPLACE_CONSENT_TEXT}</p>
      </div>

      <p className="text-center text-xs text-slate-400">
        Baca selengkapnya di{' '}
        <Link href="/kebijakan-privasi" className="font-semibold text-blue-900 underline underline-offset-2">
          Kebijakan Privasi
        </Link>
        .
      </p>

      <button
        type="submit"
        disabled={!transactionAccess}
        className="h-12 w-full rounded-xl bg-blue-900 text-base font-semibold text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        Lanjutkan
      </button>

      {!transactionAccess && (
        <p className="text-center text-xs text-slate-400">
          Aktifkan Akses Data Transaksi untuk melanjutkan ke laporan keuangan Anda.
        </p>
      )}
    </form>
  )
}
