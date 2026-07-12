'use client'

import { useId, useState } from 'react'

/**
 * Satu item FAQ dengan buka/tutup yang teranimasi halus.
 *
 * Teknik animasi: panel jawaban dibungkus grid dengan grid-template-rows
 * 0fr (tertutup) → 1fr (terbuka), child-nya overflow-hidden. Ini membuat
 * tinggi ber-transisi mulus tanpa perlu mengukur tinggi konten via JS.
 *
 * Aksesibilitas: trigger memakai <button> dengan aria-expanded + aria-controls
 * yang menunjuk id panel, sehingga pembaca layar tetap paham status buka/tutup.
 * prefers-reduced-motion mematikan transisi (buka/tutup jadi instan).
 */
export const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-slate-800"
      >
        {question}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 stroke-slate-400 transition-transform duration-300 ease-out motion-reduce:transition-none ${
            open ? 'rotate-180' : ''
          }`}
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500">{answer}</p>
        </div>
      </div>
    </div>
  )
}
