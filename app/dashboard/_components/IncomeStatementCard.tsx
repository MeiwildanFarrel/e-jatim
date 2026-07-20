import { formatRupiah } from '@/lib/format'
import type { IncomeStatement } from '@/lib/reports/financialStatements'

export function IncomeStatementCard({ data }: { data: IncomeStatement }) {
  const isProfit = data.netIncome >= 0

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5 stroke-current">
            <path d="M4 19V5m0 14h16M8 15l3-4 3 2 4-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Laporan Laba Rugi</h2>
          <p className="text-sm text-slate-500">Pendapatan dikurangi Beban untuk periode berjalan</p>
        </div>
      </div>

      <h3 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Pendapatan</h3>
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
            <tr key={r.account_code} className="border-b border-slate-50">
              <td className="py-1.5 text-slate-600">{r.account_name}</td>
              <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-200 font-semibold">
            <td className="py-1.5 text-slate-800">Total Pendapatan</td>
            <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{formatRupiah(data.totalRevenue)}</td>
          </tr>
        </tbody>
      </table>

      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Beban</h3>
      <table className="mb-5 w-full text-sm">
        <tbody>
          {data.expenses.length === 0 && (
            <tr>
              <td colSpan={2} className="py-1 italic text-slate-400">
                Belum ada beban
              </td>
            </tr>
          )}
          {data.expenses.map((r) => (
            <tr key={r.account_code} className="border-b border-slate-50">
              <td className="py-1.5 text-slate-600">{r.account_name}</td>
              <td className="py-1.5 text-right font-mono tabular-nums text-slate-700">{formatRupiah(r.amount)}</td>
            </tr>
          ))}
          <tr className="border-t-2 border-slate-200 font-semibold">
            <td className="py-1.5 text-slate-800">Total Beban</td>
            <td className="py-1.5 text-right font-mono tabular-nums text-slate-800">{formatRupiah(data.totalExpense)}</td>
          </tr>
        </tbody>
      </table>

      <div
        className={`flex items-center justify-between rounded-lg px-4 py-3 ring-1 ring-inset ${
          isProfit ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-red-50 text-red-700 ring-red-100'
        }`}
      >
        <span className="font-semibold">{isProfit ? 'Laba Bersih' : 'Rugi Bersih'}</span>
        <span className="font-mono text-lg font-bold tabular-nums">{formatRupiah(data.netIncome)}</span>
      </div>
    </section>
  )
}
