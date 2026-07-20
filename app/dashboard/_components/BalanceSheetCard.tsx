import { formatRupiah } from '@/lib/format'
import type { BalanceSheet } from '@/lib/reports/financialStatements'

export function BalanceSheetCard({ data }: { data: BalanceSheet }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5 stroke-current">
            <path d="M12 3v18M4 7h16M6 7l-2 5a3 3 0 0 0 6 0L8 7M18 7l-2 5a3 3 0 0 0 6 0l-2-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Laporan Posisi Keuangan (Neraca)</h2>
          <p className="text-sm text-slate-500">Aset di satu sisi, Liabilitas + Modal di sisi lain</p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Aset</h3>
          <table className="w-full text-sm">
            <tbody>
              {data.assets.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-1 italic text-slate-400">
                    Belum ada data aset
                  </td>
                </tr>
              )}
              {data.assets.map((r) => (
                <tr key={r.account_code} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">{r.account_name}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 font-semibold">
                <td className="py-1.5 text-slate-800">Total Aset</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{formatRupiah(data.totalAssets)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Liabilitas</h3>
          <table className="mb-4 w-full text-sm">
            <tbody>
              {data.liabilities.length === 0 && (
                <tr>
                  <td colSpan={2} className="py-1 italic text-slate-400">
                    Belum ada liabilitas
                  </td>
                </tr>
              )}
              {data.liabilities.map((r) => (
                <tr key={r.account_code} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">{r.account_name}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 font-semibold">
                <td className="py-1.5 text-slate-800">Total Liabilitas</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{formatRupiah(data.totalLiabilities)}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Modal</h3>
          <table className="w-full text-sm">
            <tbody>
              {data.equity.map((r) => (
                <tr key={r.account_code || r.account_name} className="border-b border-slate-50">
                  <td className="py-1.5 text-slate-600">{r.account_name}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-200 font-semibold">
                <td className="py-1.5 text-slate-800">Total Modal</td>
                <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{formatRupiah(data.totalEquity)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`mt-6 flex flex-col gap-1 rounded-lg px-4 py-3 ring-1 ring-inset ${
          data.isBalanced ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'
        }`}
      >
        <span className="font-semibold">
          {data.isBalanced ? '✓ Aset = Liabilitas + Modal (seimbang)' : '⚠ Aset ≠ Liabilitas + Modal — TIDAK SEIMBANG'}
        </span>
        <div className="flex justify-between font-mono text-sm tabular-nums">
          <span>Aset: {formatRupiah(data.totalAssets)}</span>
          <span>Liabilitas + Modal: {formatRupiah(data.totalLiabilities + data.totalEquity)}</span>
        </div>
        {!data.isBalanced && (
          <p className="text-sm">Selisih: {formatRupiah(data.difference)} — ada kemungkinan masalah pada data ledger, perlu dicek.</p>
        )}
      </div>
    </section>
  )
}
