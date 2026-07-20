import { formatDateID, formatRupiah } from '@/lib/format'
import type { ReportNotes } from '@/lib/reports/notes'
import type { TrialBalanceResult } from '@/lib/reports/trialBalance'

export function NotesCard({ notes, trialBalance }: { notes: ReportNotes; trialBalance: TrialBalanceResult }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.8" aria-hidden="true" className="h-5 w-5 stroke-current">
            <path d="M6 3h9l3 3v15H6z" strokeLinejoin="round" />
            <path d="M9 9h6M9 13h6M9 17h3" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="text-lg font-semibold text-slate-800">Catatan atas Laporan Keuangan</h2>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        <p>
          Periode data: <strong>{formatDateID(notes.periodStart)}</strong> s.d.{' '}
          <strong>{formatDateID(notes.periodEnd)}</strong>.
        </p>
        <p>
          Total transaksi tercatat:{' '}
          <strong className="font-mono tabular-nums">{notes.totalTransactions.toLocaleString('id-ID')}</strong>, dari sumber
          QRIS/e-wallet/marketplace (Auto-Ledger Tier 1 regex + Tier 2 klasifikasi NLP).
        </p>
        <p>
          Transaksi sudah terklasifikasi &amp; masuk laporan ini:{' '}
          <strong className="font-mono tabular-nums">{notes.classifiedTransactions.toLocaleString('id-ID')}</strong>.
        </p>
        {notes.needsTier3Count > 0 && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800 ring-1 ring-inset ring-amber-100">
            ⚠ <strong className="font-mono tabular-nums">{notes.needsTier3Count.toLocaleString('id-ID')} transaksi</strong> menunggu
            klasifikasi lanjutan (Tier 3) dan <strong>belum tercermin</strong> di laporan di atas — laporan ini belum
            mencakup seluruh data transaksi.
          </p>
        )}
        <p className="text-slate-500">
          Trial balance: total debit{' '}
          <span className="font-mono tabular-nums">{formatRupiah(trialBalance.total_debit)}</span> = total kredit{' '}
          <span className="font-mono tabular-nums">{formatRupiah(trialBalance.total_kredit)}</span> (
          {trialBalance.is_balance ? 'seimbang' : 'TIDAK seimbang'}).
        </p>
      </div>
    </section>
  )
}
