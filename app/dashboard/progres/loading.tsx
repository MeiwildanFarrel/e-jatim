import { Skeleton } from '../_components/Skeleton'

export default function ProgresLoading() {
  return (
    <>
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <Skeleton className="h-7 w-52 max-w-full" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-9 w-24 shrink-0 rounded-lg" />
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-blue-950/90 px-6 py-4">
          <div>
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="mt-2 h-5 w-40 bg-white/20" />
          </div>
          <Skeleton className="h-8 w-14 bg-white/20" />
        </div>
        <div className="p-6">
          <Skeleton className="h-4 w-72 max-w-full" />
          <Skeleton className="mt-4 h-11 w-full rounded-lg" />
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="grid grid-cols-10 gap-2">
              {Array.from({ length: 30 }, (_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-full" />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
