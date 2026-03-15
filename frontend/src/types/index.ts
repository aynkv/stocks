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
