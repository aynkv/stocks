import { useEffect, useState } from 'react'
import type { Stock } from '../types'

interface Props {
  onSelect: (stock: Stock) => void
  selectedStock: Stock | null
}

const STORAGE_KEY = 'stockpulse_watchlist'

export function Watchlist({ onSelect, selectedStock }: Props) {
  const [watchlist, setWatchlist] = useState<Stock[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist))
  }, [watchlist])

  function addCurrent() {
    if (!selectedStock) return
    if (watchlist.some(s => s.ticker === selectedStock.ticker)) return
    setWatchlist(prev => [selectedStock, ...prev])
  }

  function remove(ticker: string) {
    setWatchlist(prev => prev.filter(s => s.ticker !== ticker))
  }

  const canAdd = selectedStock && !watchlist.some(s => s.ticker === selectedStock.ticker)

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-medium text-dark-400 uppercase tracking-widest">Watchlist</h2>
        {canAdd && (
          <button
            onClick={addCurrent}
            className="flex items-center gap-1 text-xs text-pulse-orange hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-pulse-orange-glow"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
            </svg>
            Add
          </button>
        )}
      </div>

      {/* Items */}
      {watchlist.length === 0 ? (
        <p className="text-xs text-dark-500 leading-relaxed">
          Select a stock and click Add to build your watchlist.
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          {watchlist.map(stock => (
            <div
              key={stock.ticker}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ${
                selectedStock?.ticker === stock.ticker
                  ? 'bg-pulse-orange-glow border border-pulse-orange/30'
                  : 'hover:bg-dark-700 border border-transparent'
              }`}
              onClick={() => onSelect(stock)}
            >
              <span className={`font-mono text-xs font-medium flex-1 ${
                selectedStock?.ticker === stock.ticker ? 'text-pulse-orange' : 'text-dark-200 group-hover:text-dark-100'
              }`}>
                {stock.ticker}
              </span>
              <button
                onClick={e => { e.stopPropagation(); remove(stock.ticker) }}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:text-red-400 text-dark-500"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
