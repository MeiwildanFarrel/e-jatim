import { Skeleton } from '../dashboard/_components/Skeleton'

export default function BankListLoading() {
  return (
    <>
      <header>
        <Skeleton className="h-7 w-52" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </header>
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-10" />
          </div>
        ))}
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <Skeleton className="h-5 w-36" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </section>
    </>
  )
}
