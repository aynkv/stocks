export function NewsCardSkeleton() {
  return (
      <div className="rounded-2xl bg-dark-800 border border-dark-600 overflow-hidden">
        <div className="flex gap-5 p-5">
          {/* Image placeholder */}
          <div className="flex-shrink-0 w-28 h-28 rounded-xl shimmer-bg" />
          {/* Text placeholders */}
          <div className="flex-1 flex flex-col justify-between gap-3 py-1">
            <div className="h-4 w-20 rounded-lg shimmer-bg" />
            <div className="flex flex-col gap-2">
              <div className="h-5 w-full rounded-lg shimmer-bg" />
              <div className="h-5 w-4/5 rounded-lg shimmer-bg" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-full rounded shimmer-bg" />
              <div className="h-3.5 w-3/4 rounded shimmer-bg" />
            </div>
            <div className="h-3 w-24 rounded shimmer-bg" />
          </div>
        </div>
      </div>
  )
}

export function NewsFeedSkeleton() {
  return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
            <NewsCardSkeleton key={i} />
        ))}
      </div>
  )
}
