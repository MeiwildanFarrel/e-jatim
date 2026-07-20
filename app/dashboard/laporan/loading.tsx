import { Skeleton, SkeletonCard } from '../_components/Skeleton'

export default function LaporanLoading() {
  return (
    <>
      <header>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-80 max-w-full" />
      </header>
      <SkeletonCard titleWidth="w-44" lines={5} />
      <SkeletonCard titleWidth="w-52" lines={6} />
      <SkeletonCard titleWidth="w-64" lines={3} />
    </>
  )
}
