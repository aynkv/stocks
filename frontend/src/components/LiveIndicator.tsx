interface Props {
  ticker: string
  articleCount: number
}

export function LiveIndicator({ ticker, articleCount }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center w-5 h-5">
          <span className="absolute inline-flex w-3 h-3 rounded-full bg-pulse-orange opacity-30 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-pulse-orange animate-pulse-dot" />
        </div>
        <span className="text-sm font-medium text-dark-200">
          Live — <span className="font-mono text-pulse-orange">{ticker}</span>
        </span>
      </div>

      <span className="text-xs text-dark-400">
        {articleCount} article{articleCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
