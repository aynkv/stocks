import { useState, useEffect, useCallback } from 'react'
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, ReferenceLine,
} from 'recharts'
import { quotesApi } from '../api'
import type { PriceHistoryDTO, TimeRange } from '../types'

interface Props {
  ticker: string
}

const RANGES: { label: string; value: TimeRange }[] = [
  { label: '1W', value: 7 },
  { label: '1M', value: 30 },
  { label: '3M', value: 90 },
  { label: '6M', value: 180 },
  { label: '1Y', value: 365 },
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const isUp = d.close >= d.open

  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl px-4 py-3 shadow-xl text-sm">
      <p className="text-dark-300 mb-2 font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1">
        <span className="text-dark-400">Open</span>
        <span className="text-dark-100 text-right font-mono">${d.open?.toFixed(2)}</span>
        <span className="text-dark-400">Close</span>
        <span className={`text-right font-mono font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
          ${d.close?.toFixed(2)}
        </span>
        <span className="text-dark-400">High</span>
        <span className="text-dark-100 text-right font-mono">${d.high?.toFixed(2)}</span>
        <span className="text-dark-400">Low</span>
        <span className="text-dark-100 text-right font-mono">${d.low?.toFixed(2)}</span>
      </div>
    </div>
  )
}

export function PriceChart({ ticker }: Props) {
  const [data, setData] = useState<PriceHistoryDTO | null>(null)
  const [range, setRange] = useState<TimeRange>(30)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const load = useCallback(async (t: string, r: TimeRange) => {
    setLoading(true)
    setError(false)
    // Don't clear data immediately — keeps the quote header visible during range switch
    try {
      const result = await quotesApi.getHistory(t, r)
      setData(result)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  // Reset state when ticker changes
  useEffect(() => {
    setData(null)
    setRange(30)
    load(ticker, 30)
  }, [ticker])

  // Re-fetch when range changes (ticker stays the same)
  useEffect(() => {
    if (data !== null) {  // skip the initial load handled above
      load(ticker, range)
    }
  }, [range])

  const quote = data?.quote
  const candles = data?.candles ?? []

  // isUp based on the range-adjusted change the backend computed
  const isUp = (quote?.change ?? 0) >= 0
  const color = isUp ? '#34d399' : '#f87171'

  // Y-axis domain with padding
  const closes = candles.map(c => c.close).filter(Boolean)
  const minClose = closes.length ? Math.min(...closes) : 0
  const maxClose = closes.length ? Math.max(...closes) : 0
  const pad = (maxClose - minClose) * 0.12 || 2
  const yDomain: [number, number] = [minClose - pad, maxClose + pad]

  const gradientId = `grad-${ticker}`
  const xInterval = range <= 30 ? 4 : range <= 90 ? 3 : 7

  const rangeLabel: Record<TimeRange, string> = {
    7: '1 week', 30: '1 month', 90: '3 months', 180: '6 months', 365: '1 year'
  }

  return (
    <div className="rounded-2xl bg-dark-800 border border-dark-600 overflow-hidden">

      {/* Quote header */}
      <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-dark-700">
        <div>
          {/* Price + change */}
          <div className="flex items-baseline gap-3 flex-wrap">
            {!quote || (loading && !data) ? (
              <div className="h-9 w-36 rounded-lg shimmer-bg" />
            ) : (
              <>
                <span className="text-3xl font-bold text-dark-100 tabular-nums font-mono">
                  ${quote.current.toFixed(2)}
                </span>
                <span className={`flex items-center gap-1 text-base font-semibold ${
                  isUp ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isUp ? '▲' : '▼'}
                  {Math.abs(quote.change).toFixed(2)}
                  <span className="text-sm font-medium opacity-80">
                    ({isUp ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                  </span>
                </span>
                <span className="text-xs text-dark-500 self-center">
                  over {rangeLabel[range]}
                </span>
              </>
            )}
          </div>

          {/* OHLC row */}
          {quote && !loading && (
            <div className="flex gap-4 mt-2">
              {[
                { label: 'O', value: quote.open },
                { label: 'H', value: quote.high },
                { label: 'L', value: quote.low },
                { label: 'PC', value: quote.previousClose },
              ].map(({ label, value }) => (
                <span key={label} className="text-xs text-dark-500 font-mono">
                  <span className="text-dark-400 not-italic mr-1">{label}</span>
                  ${value.toFixed(2)}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Timeframe selector */}
        <div className="flex gap-1 bg-dark-700 rounded-xl p-1 flex-shrink-0">
          {RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              disabled={loading}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                range === r.value
                  ? 'bg-pulse-orange text-white shadow'
                  : 'text-dark-400 hover:text-dark-200 disabled:opacity-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="px-2 pt-4 pb-2 relative">

        {/* Loading overlay — keeps old chart visible while switching ranges */}
        {loading && data && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-dark-800/60 backdrop-blur-[1px] rounded-b-2xl">
            <div className="flex gap-1.5 items-end h-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1.5 bg-pulse-orange/50 rounded-full animate-pulse"
                  style={{ height: `${40 + Math.sin(i) * 30}%`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        )}

        {/* Initial load spinner */}
        {loading && !data && (
          <div className="h-56 flex items-center justify-center">
            <div className="flex gap-1.5 items-end h-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-1.5 bg-pulse-orange/40 rounded-full animate-pulse"
                  style={{ height: `${40 + Math.sin(i) * 30}%`, animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="h-56 flex items-center justify-center text-dark-500 text-sm">
            Chart data unavailable for this ticker.
          </div>
        )}

        {!loading && !error && candles.length === 0 && (
          <div className="h-56 flex flex-col items-center justify-center gap-2 text-dark-500 text-sm">
            <span>No price data for this range.</span>
            <span className="text-xs text-dark-600">Try a different timeframe.</span>
          </div>
        )}

        {candles.length > 0 && (
          <ResponsiveContainer width="100%" height={224}>
            <AreaChart data={candles} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tick={{ fill: '#6b6b7a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                interval={xInterval}
              />
              <YAxis
                domain={yDomain}
                tick={{ fill: '#6b6b7a', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `$${v.toFixed(0)}`}
                width={54}
              />
              <Tooltip content={<ChartTooltip />} />

              {/* Previous close dashed reference line */}
              {quote?.previousClose && (
                <ReferenceLine
                  y={quote.previousClose}
                  stroke="#44444f"
                  strokeDasharray="4 4"
                  strokeWidth={1}
                />
              )}

              <Area
                type="monotone"
                dataKey="close"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={400}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}