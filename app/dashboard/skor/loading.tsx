import { Skeleton } from '../_components/Skeleton'

export default function SkorLoading() {
  return (
    <>
      <header>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </header>
      <section className="rounded-lg border border-slate-200 bg-white p-6">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-8">
          <Skeleton className="mx-auto h-[110px] w-full max-w-[220px] rounded-full" />
          <div className="w-full space-y-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </section>
    </>
  )
}
