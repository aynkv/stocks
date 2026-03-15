export function NewsCardSkeleton() {
  return (
    <div className="rounded-xl bg-dark-800 card-border overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Image placeholder */}
        <div className="flex-shrink-0 w-20 h-20 rounded-lg shimmer-bg" />

        {/* Text placeholders */}
        <div className="flex-1 flex flex-col gap-3 py-1">
          <div className="h-3 w-24 rounded shimmer-bg" />
          <div className="h-4 w-full rounded shimmer-bg" />
          <div className="h-4 w-4/5 rounded shimmer-bg" />
          <div className="h-3 w-3/5 rounded shimmer-bg" />
        </div>
      </div>
    </div>
  )
}

export function NewsFeedSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <NewsCardSkeleton key={i} />
      ))}
    </div>
  )
}
