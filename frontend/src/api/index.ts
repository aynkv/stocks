import axios from 'axios'
import type { NewsArticle, Stock } from '../types'

const client = axios.create({
  baseURL: '/api',
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
