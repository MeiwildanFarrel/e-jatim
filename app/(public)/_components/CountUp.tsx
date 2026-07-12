'use client'

import { useEffect, useRef } from 'react'

const formatId = (n: number) => Math.round(n).toLocaleString('id-ID')

/**
 * Angka statistik yang "menghitung naik" saat masuk viewport.
 * - SSR merender nilai AKHIR, jadi tanpa JS / dengan reduced-motion angka
 *   tetap terbaca penuh (animasi bukan satu-satunya pembawa informasi).
 * - Animasi berjalan sekali, ~1,4 detik, easing melambat di ujung.
 */
export const CountUp = ({
  value,
  prefix = '',
  suffix = '',
  durationMs = 1400,
}: {
  value: number
  prefix?: string
  suffix?: string
  durationMs?: number
}) => {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let rafId = 0
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        observer.disconnect()

        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min((now - start) / durationMs, 1)
          const eased = 1 - Math.pow(1 - t, 3)
          el.textContent = `${prefix}${formatId(value * eased)}${suffix}`
          if (t < 1) rafId = requestAnimationFrame(tick)
        }
        rafId = requestAnimationFrame(tick)
      },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafId)
    }
  }, [value, prefix, suffix, durationMs])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {formatId(value)}
      {suffix}
    </span>
  )
}
