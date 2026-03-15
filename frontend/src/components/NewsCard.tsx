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
          className={`
        block group relative overflow-hidden
        rounded-2xl transition-all duration-300
        ${isNew
              ? 'bg-dark-800 border border-pulse-orange/40 shadow-[0_0_30px_rgba(249,115,22,0.07)] hover:shadow-[0_0_40px_rgba(249,115,22,0.13)] hover:border-pulse-orange/60'
              : 'bg-dark-800 border border-dark-600 hover:border-dark-400 hover:bg-dark-700'
          }
      `}
      >
        {/* NEW article: left orange accent bar */}
        {isNew && (
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-pulse-orange rounded-l-2xl" />
        )}

        <div className="flex gap-5 p-5 pl-6">

          {/* Image */}
          {article.imageUrl ? (
              <div className="flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden bg-dark-700">
                <img
                    src={article.imageUrl}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={e => {
                      const el = e.target as HTMLImageElement
                      el.parentElement!.style.display = 'none'
                    }}
                />
              </div>
          ) : (
              <div className="flex-shrink-0 w-28 h-28 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center">
                <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 py-1">

            {/* Top row: source + NEW badge + time */}
            <div className="flex items-center gap-2.5">
              {isNew && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg
                bg-pulse-orange/10 border border-pulse-orange/30
                text-pulse-orange text-[11px] font-semibold uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-pulse-orange animate-pulse-dot" />
                Live
              </span>
              )}
              {article.source && (
                  <span className="text-sm text-dark-400 font-medium">
                {article.source}
              </span>
              )}
              <span className="text-sm text-dark-500 ml-auto flex-shrink-0 tabular-nums">
              {timeAgo}
            </span>
            </div>

            {/* Headline */}
            <h3 className="text-[17px] font-semibold text-dark-100 leading-snug
            group-hover:text-white transition-colors duration-200
            line-clamp-2">
              {article.headline}
            </h3>

            {/* Summary */}
            {article.summary && (
                <p className="text-sm text-dark-400 leading-relaxed line-clamp-2">
                  {article.summary}
                </p>
            )}

            {/* Read more */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-dark-500
            group-hover:text-pulse-orange transition-colors duration-200 mt-auto">
              Read full article
              <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-200"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </div>
        </div>
      </a>
  )
}
