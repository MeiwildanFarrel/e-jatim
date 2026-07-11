import { formatRupiah } from '@/lib/format'
import type { BalanceSheet } from '@/lib/reports/financialStatements'

export function BalanceSheetCard({ data }: { data: BalanceSheet }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Laporan Posisi Keuangan (Neraca)</h2>
      <p className="mb-4 text-sm text-slate-500">Aset di satu sisi, Liabilitas + Modal di sisi lain</p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-500">Aset</h3>
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
                <tr key={r.account_code}>
                  <td className="py-1 text-slate-700">{r.account_name}</td>
                  <td className="py-1 text-right tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-1 text-slate-800">Total Aset</td>
                <td className="py-1 text-right tabular-nums text-slate-800">{formatRupiah(data.totalAssets)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-slate-500">Liabilitas</h3>
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
                <tr key={r.account_code}>
                  <td className="py-1 text-slate-700">{r.account_name}</td>
                  <td className="py-1 text-right tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-1 text-slate-800">Total Liabilitas</td>
                <td className="py-1 text-right tabular-nums text-slate-800">{formatRupiah(data.totalLiabilities)}</td>
              </tr>
            </tbody>
          </table>

          <h3 className="mb-2 text-sm font-medium text-slate-500">Modal</h3>
          <table className="w-full text-sm">
            <tbody>
              {data.equity.map((r) => (
                <tr key={r.account_code || r.account_name}>
                  <td className="py-1 text-slate-700">{r.account_name}</td>
                  <td className="py-1 text-right tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
                </tr>
              ))}
              <tr className="border-t border-slate-200 font-semibold">
                <td className="py-1 text-slate-800">Total Modal</td>
                <td className="py-1 text-right tabular-nums text-slate-800">{formatRupiah(data.totalEquity)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div
        className={`mt-6 flex flex-col gap-1 rounded-md px-4 py-3 ${
          data.isBalanced ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span className="font-semibold">
          {data.isBalanced ? '✓ Aset = Liabilitas + Modal (seimbang)' : '⚠ Aset ≠ Liabilitas + Modal — TIDAK SEIMBANG'}
        </span>
        <div className="flex justify-between text-sm tabular-nums">
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
