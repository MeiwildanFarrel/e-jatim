'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Wrapper fade/slide-in satu kali saat elemen masuk viewport.
 * - Nilai/teks di dalamnya selalu ada di markup (SSR) — animasi murni kosmetik.
 * - prefers-reduced-motion: kelas .is-visible langsung dipasang tanpa transisi
 *   (transisinya sendiri juga dimatikan di globals.css sebagai lapisan kedua).
 */
export const Reveal = ({
  children,
  className = '',
  delayMs = 0,
}: {
  children: ReactNode
  className?: string
  delayMs?: number
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('is-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </div>
  )
}
