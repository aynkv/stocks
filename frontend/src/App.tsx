import { useState, useCallback } from 'react'
import type { NewsArticle, Stock } from './types'
import { newsApi } from './api'
import { StockSearch } from './components/StockSearch'
import { NewsCard } from './components/NewsCard'
import { LiveIndicator } from './components/LiveIndicator'
import { Watchlist } from './components/Watchlist'
import { NewsFeedSkeleton } from './components/Skeletons'
import { useNewsStream } from './hooks/useNewsStream'

export default function App() {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null)
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [newIds, setNewIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Called when the SSE server pushes new articles
  const handleNewArticles = useCallback((incoming: NewsArticle[]) => {
    setArticles(prev => {
      const existingIds = new Set(prev.map(a => a.id))
      const fresh = incoming.filter(a => !existingIds.has(a.id))
      if (fresh.length === 0) return prev
      setNewIds(ids => new Set([...ids, ...fresh.map(a => a.id)]))
      // Clear "new" highlight after 8 seconds
      setTimeout(() => {
        setNewIds(ids => {
          const next = new Set(ids)
          fresh.forEach(a => next.delete(a.id))
          return next
        })
      }, 8000)
      return [...fresh, ...prev]
    })
  }, [])

  // Open SSE stream whenever selectedStock changes
  useNewsStream(selectedStock?.ticker ?? null, handleNewArticles)

  async function selectStock(stock: Stock) {
    setSelectedStock(stock)
    setArticles([])
    setError(null)
    setLoading(true)

    try {
      const data = await newsApi.getByTicker(stock.ticker)
      setArticles(data)
    } catch (e) {
      setError('Failed to load news. Please try again.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 font-body">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-sm border-b border-dark-600">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-pulse-orange flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-dark-100 tracking-tight">
              Stock<span className="text-pulse-orange">Pulse</span>
            </span>
          </div>

          {/* Search */}
          <StockSearch onSelect={selectStock} selectedStock={selectedStock} />

          {/* Right side spacer / future: auth button */}
          <div className="ml-auto flex-shrink-0">
            <span className="text-xs text-dark-500 font-mono">v0.1.0</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="max-w-6xl mx-auto px-6 py-8 flex gap-8">

        {/* News feed */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Feed header */}
          {selectedStock && !loading && (
            <LiveIndicator
              ticker={selectedStock.ticker}
              articleCount={articles.length}
            />
          )}

          {/* Empty state — no stock selected */}
          {!selectedStock && !loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-dark-700 border border-dark-600 flex items-center justify-center">
                <svg className="w-7 h-7 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div>
                <p className="text-dark-200 font-medium">Select a stock to get started</p>
                <p className="text-dark-500 text-sm mt-1">Search above for any ticker or company name</p>
              </div>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && <NewsFeedSkeleton />}

          {/* Error state */}
          {error && (
            <div className="rounded-xl bg-red-950/30 border border-red-900/40 px-5 py-4 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="text-sm text-red-300">{error}</p>
              <button
                onClick={() => selectedStock && selectStock(selectedStock)}
                className="ml-auto text-xs text-red-400 hover:text-red-300 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty feed — stock selected but no news */}
          {!loading && !error && selectedStock && articles.length === 0 && (
            <div className="text-center py-16">
              <p className="text-dark-400 text-sm">No recent news found for <span className="font-mono text-pulse-orange">{selectedStock.ticker}</span>.</p>
              <p className="text-dark-500 text-xs mt-1">New articles will appear automatically when available.</p>
            </div>
          )}

          {/* Articles */}
          {!loading && articles.length > 0 && (
            <div className="flex flex-col gap-3">
              {articles.map(article => (
                <NewsCard
                  key={article.id}
                  article={article}
                  isNew={newIds.has(article.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Watchlist sidebar */}
        <Watchlist onSelect={selectStock} selectedStock={selectedStock} />
      </main>
    </div>
  )
}
