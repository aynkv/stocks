export interface Stock {
  id: number
  ticker: string
  name: string
  exchange: string
  sector: string
}

export interface NewsArticle {
  id: number
  ticker: string
  headline: string
  summary: string
  url: string
  source: string
  imageUrl: string
  publishedAt: string   // ISO-8601 string from backend
  fetchedAt?: string
}

export interface QuoteDTO {
  ticker: string
  current: number
  change: number
  changePercent: number
  high: number
  low: number
  open: number
  previousClose: number
}

export interface CandleDTO {
  timestamp: number
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface PriceHistoryDTO {
  quote: QuoteDTO
  candles: CandleDTO[]
  resolution: string
}

export type TimeRange = 7 | 30 | 90 | 180 | 365
