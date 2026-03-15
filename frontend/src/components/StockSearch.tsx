import { useState, useEffect, useRef } from 'react'
import type { Stock } from '../types'
import { stocksApi } from '../api'

interface Props {
  onSelect: (stock: Stock) => void
  selectedStock: Stock | null
}

export function StockSearch({ onSelect, selectedStock }: Props) {
  const [query, setQuery] = useState('')
  const [stocks, setStocks] = useState<Stock[]>([])
  const [filtered, setFiltered] = useState<Stock[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load all stocks once on mount
  useEffect(() => {
    stocksApi.getAll()
      .then(setStocks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Filter client-side on keystroke
  useEffect(() => {
    if (!query.trim()) {
      setFiltered(stocks.slice(0, 20))
      return
    }
    const q = query.toLowerCase()
    setFiltered(
      stocks.filter(s =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
      ).slice(0, 20)
    )
  }, [query, stocks])

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function handleSelect(stock: Stock) {
    onSelect(stock)
    setQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const sectorColors: Record<string, string> = {
    Technology: 'text-blue-400',
    Finance:    'text-green-400',
    Healthcare: 'text-red-400',
    Energy:     'text-yellow-400',
    Consumer:   'text-purple-400',
    Industrial: 'text-gray-400',
  }

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Input */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl bg-dark-700 border transition-all duration-200 ${
          open ? 'border-pulse-orange orange-glow' : 'border-dark-600 hover:border-dark-500'
        }`}
      >
        {/* Search icon */}
        <svg className="w-4 h-4 text-dark-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={selectedStock ? `${selectedStock.ticker} — ${selectedStock.name}` : 'Search stocks...'}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-dark-100 placeholder-dark-400 text-sm outline-none font-body"
        />

        {/* Selected ticker badge */}
        {selectedStock && !query && (
          <span className="flex-shrink-0 px-2 py-0.5 rounded-md bg-pulse-orange-glow text-pulse-orange text-xs font-mono font-medium border border-pulse-orange/20">
            {selectedStock.ticker}
          </span>
        )}

        {/* Loading spinner */}
        {loading && (
          <svg className="w-4 h-4 text-dark-400 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
          </svg>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="max-h-72 overflow-y-auto py-1">
            {filtered.map(stock => (
              <button
                key={stock.ticker}
                onMouseDown={() => handleSelect(stock)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-dark-700 transition-colors text-left group"
              >
                {/* Ticker */}
                <span className="font-mono text-sm font-medium text-pulse-orange w-16 flex-shrink-0">
                  {stock.ticker}
                </span>

                {/* Name */}
                <span className="flex-1 text-sm text-dark-200 truncate group-hover:text-dark-100 transition-colors">
                  {stock.name}
                </span>

                {/* Sector */}
                <span className={`text-xs flex-shrink-0 ${sectorColors[stock.sector] ?? 'text-dark-400'}`}>
                  {stock.sector}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
