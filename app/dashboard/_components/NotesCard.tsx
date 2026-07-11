import { formatDateID, formatRupiah } from '@/lib/format'
import type { ReportNotes } from '@/lib/reports/notes'
import type { TrialBalanceResult } from '@/lib/reports/trialBalance'

export function NotesCard({ notes, trialBalance }: { notes: ReportNotes; trialBalance: TrialBalanceResult }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Catatan atas Laporan Keuangan</h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">
        <p>
          Periode data: <strong>{formatDateID(notes.periodStart)}</strong> s.d.{' '}
          <strong>{formatDateID(notes.periodEnd)}</strong>.
        </p>
        <p>
          Total transaksi tercatat: <strong>{notes.totalTransactions.toLocaleString('id-ID')}</strong>, dari sumber
          QRIS/e-wallet/marketplace (Auto-Ledger Tier 1 regex + Tier 2 klasifikasi NLP).
        </p>
        <p>
          Transaksi sudah terklasifikasi &amp; masuk laporan ini:{' '}
          <strong>{notes.classifiedTransactions.toLocaleString('id-ID')}</strong>.
        </p>
        {notes.needsTier3Count > 0 && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-amber-800">
            ⚠ <strong>{notes.needsTier3Count.toLocaleString('id-ID')} transaksi</strong> menunggu klasifikasi lanjutan
            (Tier 3) dan <strong>belum tercermin</strong> di laporan di atas — laporan ini belum mencakup seluruh
            data transaksi.
          </p>
        )}
        <p className="text-slate-500">
          Trial balance: total debit {formatRupiah(trialBalance.total_debit)} = total kredit{' '}
          {formatRupiah(trialBalance.total_kredit)} ({trialBalance.is_balance ? 'seimbang' : 'TIDAK seimbang'}).
        </p>
      </div>
    </section>
  )
}
