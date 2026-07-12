/**
 * Visual hero orisinal (murni HTML/CSS, tanpa foto stok / logo pihak ketiga):
 * kartu "buku besar otomatis" — transaksi harian masuk, langsung terklasifikasi
 * ke pos SAK EMKM — plus chip skor kredit mengambang. Ini miniatur alur nilai
 * produk: transaksi mentah → catatan rapi → skor.
 * Angka di sini contoh ilustratif (berlabel), bukan klaim statistik.
 */
export const HeroVisual = () => (
  <div className="relative mx-auto w-full max-w-md" aria-hidden="true">
    {/* latar: garis kolom buku besar */}
    <div
      className="absolute -inset-4 rounded-3xl border border-slate-200 bg-slate-50 sm:-inset-6"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 27px, #e2e8f0 27px, #e2e8f0 28px)',
      }}
    />

    <div className="relative rotate-[-1.5deg] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-200/60 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Pembukuan otomatis · hari ini
        </p>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-400">
          ilustrasi
        </span>
      </div>

      <ul className="mt-3 divide-y divide-slate-100 font-mono text-xs">
        {[
          { desc: 'QRIS · Penjualan nasi campur', amount: 'Rp250.000', pos: 'Pendapatan Penjualan', in: true },
          { desc: 'E-wallet · Beli bahan baku', amount: 'Rp180.000', pos: 'Beban Bahan Baku', in: false },
          { desc: 'Marketplace · Pesanan katering', amount: 'Rp1.250.000', pos: 'Pendapatan Penjualan', in: true },
        ].map((row) => (
          <li key={row.desc} className="flex flex-col gap-1 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-slate-600">{row.desc}</span>
              <span className={`shrink-0 tabular-nums font-semibold ${row.in ? 'text-emerald-600' : 'text-slate-700'}`}>
                {row.in ? '+' : '−'}{row.amount}
              </span>
            </div>
            <span className="inline-flex w-fit items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-blue-900">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 fill-emerald-500">
                <path d="M4.8 8.4 2.4 6l-.9.9 3.3 3.3 6-6-.9-.9z" />
              </svg>
              {row.pos}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-3 border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500">
        Debit = Kredit <span className="text-emerald-600">✓ seimbang</span>, siap dibaca bank
      </p>
    </div>

    {/* chip skor mengambang */}
    <div className="absolute -bottom-5 -right-1 rotate-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg shadow-slate-200/80 sm:-right-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        Skor kredit alternatif
      </p>
      <p className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-800">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        Hijau · <span className="tabular-nums">72/100</span>
      </p>
    </div>
  </div>
)
