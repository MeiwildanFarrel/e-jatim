import { Skeleton, SkeletonCard } from './_components/Skeleton'

export default function RingkasanLoading() {
  return (
    <>
      <header>
        <Skeleton className="h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      </header>
      <SkeletonCard titleWidth="w-48" lines={2} />
      <SkeletonCard titleWidth="w-36" lines={2} />
    </>
  )
}
