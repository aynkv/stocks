import axios from 'axios'
import type { NewsArticle, Stock } from '../types'

// In dev: Vite proxy forwards /api → localhost:8080 (see vite.config.ts)
// In prod: VITE_API_BASE_URL is set to the full Railway backend URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api'

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
})

export const stocksApi = {
  getAll: () => client.get<Stock[]>('/stocks').then(r => r.data),
  search: (q: string) => client.get<Stock[]>('/stocks/search', { params: { q } }).then(r => r.data),
}

export const newsApi = {
  getByTicker: (ticker: string) =>
      client.get<NewsArticle[]>(`/news/${ticker}`).then(r => r.data),
}
