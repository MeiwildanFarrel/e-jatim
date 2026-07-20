// Primitif skeleton loading — dipakai semua loading.tsx dashboard & bank
// (import relatif dari app/bank/, konsisten dengan pola reuse komponen
// laporan/skor yang sudah ada). Palet slate sesuai DESIGN.md, animasi pulse
// bawaan Tailwind dimatikan untuk prefers-reduced-motion (transien — cuma
// tampil selama loading, tapi tetap dihormati konsisten dengan aturan
// animasi di seluruh app).

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none ${className}`} />
}

export function SkeletonCard({ titleWidth = 'w-40', lines = 3 }: { titleWidth?: string; lines?: number }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <Skeleton className={`h-5 ${titleWidth}`} />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: lines }, (_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </section>
  )
}
