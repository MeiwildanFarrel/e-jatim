'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function DecisionButtons({ applicationId }: { applicationId: string }) {
  const router = useRouter()
  const [notes, setNotes] = useState('')
  const [pending, setPending] = useState<'approved' | 'rejected' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(status: 'approved' | 'rejected') {
    setPending(status)
    setError(null)
    try {
      const res = await fetch(`/api/bank/loan-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, decision_notes: notes.trim() || undefined }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message ?? 'Gagal menyimpan keputusan')
      }
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan keputusan')
      setPending(null)
    }
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-800">Keputusan</h2>

      <label htmlFor="decision-notes" className="mt-3 block text-sm font-medium text-slate-600">
        Catatan analis <span className="font-normal text-slate-400">(opsional)</span>
      </label>
      <textarea
        id="decision-notes"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={3}
        className="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-700 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900"
        placeholder="Catatan tambahan untuk keputusan ini..."
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => decide('approved')}
          disabled={pending !== null}
          className="h-12 flex-1 rounded-xl bg-emerald-600 text-base font-semibold text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === 'approved' ? 'Menyimpan…' : 'Setujui'}
        </button>
        <button
          type="button"
          onClick={() => decide('rejected')}
          disabled={pending !== null}
          className="h-12 flex-1 rounded-xl border border-red-200 bg-white text-base font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === 'rejected' ? 'Menyimpan…' : 'Tolak'}
        </button>
      </div>
    </section>
  )
}
