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

  const handleNewArticles = useCallback((incoming: NewsArticle[]) => {
    setArticles(prev => {
      const existingIds = new Set(prev.map(a => a.id))
      const fresh = incoming.filter(a => !existingIds.has(a.id))
      if (fresh.length === 0) return prev
      setNewIds(ids => new Set([...ids, ...fresh.map(a => a.id)]))
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

  function goHome() {
    setSelectedStock(null)
    setArticles([])
    setError(null)
  }

  return (
      <div className="min-h-screen bg-dark-900 font-body">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-dark-900/90 backdrop-blur-sm border-b border-dark-600">
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center gap-8">

            {/* Logo — click resets to home */}
            <button
                onClick={goHome}
                className="flex items-center gap-2.5 flex-shrink-0 group"
            >
              <div className="w-8 h-8 rounded-xl bg-pulse-orange flex items-center justify-center
              group-hover:bg-pulse-orange-dim transition-colors duration-200">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                </svg>
              </div>
              <span className="font-display text-lg font-semibold text-dark-100 tracking-tight
              group-hover:text-white transition-colors duration-200">
              Stock<span className="text-pulse-orange">Pulse</span>
            </span>
            </button>

            {/* Search */}
            <StockSearch onSelect={selectStock} selectedStock={selectedStock} />

            <div className="ml-auto flex-shrink-0">
              <span className="text-xs text-dark-500 font-mono">v0.1.0</span>
            </div>
          </div>
        </header>

        {/* Main layout */}
        <main className="max-w-7xl mx-auto px-8 py-10 flex gap-10">

          {/* News feed */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {/* Live indicator */}
            {selectedStock && !loading && (
                <LiveIndicator
                    ticker={selectedStock.ticker}
                    articleCount={articles.length}
                />
            )}

            {/* Empty state — home */}
            {!selectedStock && !loading && (
                <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
                  {/* Big icon */}
                  <div className="w-20 h-20 rounded-3xl bg-dark-700 border border-dark-600
                flex items-center justify-center">
                    <svg className="w-10 h-10 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                            d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-2xl font-semibold text-dark-100">
                      Track any stock, live.
                    </p>
                    <p className="text-base text-dark-400 max-w-sm">
                      Search for a ticker or company name above to see the latest news as it breaks.
                    </p>
                  </div>
                  {/* Suggested tickers */}
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                    {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'META'].map(t => (
                        <span key={t}
                              className="px-3 py-1.5 rounded-lg bg-dark-700 border border-dark-600
                      text-sm font-mono text-dark-300 cursor-default">
                    {t}
                  </span>
                    ))}
                  </div>
                </div>
            )}

            {/* Loading skeletons */}
            {loading && <NewsFeedSkeleton />}

            {/* Error */}
            {error && (
                <div className="rounded-2xl bg-red-950/30 border border-red-900/40 px-6 py-5 flex items-center gap-4">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <p className="text-sm text-red-300 flex-1">{error}</p>
                  <button
                      onClick={() => selectedStock && selectStock(selectedStock)}
                      className="text-sm text-red-400 hover:text-red-300 underline flex-shrink-0"
                  >
                    Retry
                  </button>
                </div>
            )}

            {/* No news found */}
            {!loading && !error && selectedStock && articles.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-dark-300 text-base">
                    No recent news for <span className="font-mono text-pulse-orange">{selectedStock.ticker}</span>.
                  </p>
                  <p className="text-dark-500 text-sm mt-2">
                    New articles will appear automatically as they're published.
                  </p>
                </div>
            )}

            {/* Articles */}
            {!loading && articles.length > 0 && (
                <div className="flex flex-col gap-4">
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