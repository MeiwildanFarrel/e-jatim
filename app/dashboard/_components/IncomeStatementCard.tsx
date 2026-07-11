import { formatRupiah } from '@/lib/format'
import type { IncomeStatement } from '@/lib/reports/financialStatements'

export function IncomeStatementCard({ data }: { data: IncomeStatement }) {
  const isProfit = data.netIncome >= 0

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Laporan Laba Rugi</h2>
      <p className="mb-4 text-sm text-slate-500">Pendapatan dikurangi Beban untuk periode berjalan</p>

      <h3 className="mb-2 text-sm font-medium text-slate-500">Pendapatan</h3>
      <table className="mb-4 w-full text-sm">
        <tbody>
          {data.revenues.length === 0 && (
            <tr>
              <td colSpan={2} className="py-1 italic text-slate-400">
                Belum ada pendapatan
              </td>
            </tr>
          )}
          {data.revenues.map((r) => (
            <tr key={r.account_code}>
              <td className="py-1 text-slate-700">{r.account_name}</td>
              <td className="py-1 text-right tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 font-semibold">
            <td className="py-1 text-slate-800">Total Pendapatan</td>
            <td className="py-1 text-right tabular-nums text-slate-800">{formatRupiah(data.totalRevenue)}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="mb-2 text-sm font-medium text-slate-500">Beban</h3>
      <table className="mb-4 w-full text-sm">
        <tbody>
          {data.expenses.length === 0 && (
            <tr>
              <td colSpan={2} className="py-1 italic text-slate-400">
                Belum ada beban
              </td>
            </tr>
          )}
          {data.expenses.map((r) => (
            <tr key={r.account_code}>
              <td className="py-1 text-slate-700">{r.account_name}</td>
              <td className="py-1 text-right tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 font-semibold">
            <td className="py-1 text-slate-800">Total Beban</td>
            <td className="py-1 text-right tabular-nums text-slate-800">{formatRupiah(data.totalExpense)}</td>
          </tr>
        </tbody>
      </table>

      <div
        className={`flex items-center justify-between rounded-md px-4 py-3 ${
          isProfit ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        <span className="font-semibold">{isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</span>
        <span className="text-lg font-semibold tabular-nums">{formatRupiah(data.netIncome)}</span>
      </div>
    </section>
  )
}
