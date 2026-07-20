import { Skeleton, SkeletonCard } from '../_components/Skeleton'

export default function AjukanKurLoading() {
  return (
    <>
      <header>
        <Skeleton className="h-7 w-36" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </header>
      <SkeletonCard titleWidth="w-32" lines={2} />
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-2 h-4 w-full" />
        <Skeleton className="mt-4 h-12 w-40 rounded-xl" />
      </section>
    </>
  )
}
