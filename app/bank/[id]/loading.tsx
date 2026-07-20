import { Skeleton, SkeletonCard } from '../../dashboard/_components/Skeleton'

export default function BankDetailLoading() {
  return (
    <>
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-48" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        </div>
        <Skeleton className="h-7 w-32 rounded-full" />
      </header>
      <SkeletonCard titleWidth="w-24" lines={2} />
      <SkeletonCard titleWidth="w-44" lines={3} />
      <SkeletonCard titleWidth="w-44" lines={5} />
      <SkeletonCard titleWidth="w-52" lines={6} />
    </>
  )
}
