import { formatDistanceToNow } from 'date-fns'
import type { NewsArticle } from '../types'

interface Props {
  article: NewsArticle
  isNew?: boolean
}

export function NewsCard({ article, isNew = false }: Props) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block group rounded-xl bg-dark-800 card-border hover:border-dark-500 transition-all duration-200 overflow-hidden ${
        isNew ? 'animate-slide-in border-pulse-orange/30 hover:border-pulse-orange/50' : ''
      }`}
    >
      <div className="flex gap-4 p-4">
        {/* Article image */}
        {article.imageUrl && (
          <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-dark-700">
            <img
              src={article.imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Source + time row */}
          <div className="flex items-center gap-2">
            {isNew && (
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-pulse-orange-glow border border-pulse-orange/30 text-pulse-orange text-[10px] font-medium uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-pulse-orange animate-pulse-dot inline-block" />
                New
              </span>
            )}
            {article.source && (
              <span className="text-xs text-dark-400 font-medium truncate">
                {article.source}
              </span>
            )}
            <span className="text-xs text-dark-500 ml-auto flex-shrink-0">
              {timeAgo}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-sm font-medium text-dark-100 leading-snug group-hover:text-white transition-colors line-clamp-2">
            {article.headline}
          </h3>

          {/* Summary */}
          {article.summary && (
            <p className="text-xs text-dark-400 leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          )}
        </div>
      </div>

      {/* Bottom accent bar on new articles */}
      {isNew && (
        <div className="h-px bg-gradient-to-r from-pulse-orange/40 via-pulse-orange/20 to-transparent" />
      )}
    </a>
  )
}
