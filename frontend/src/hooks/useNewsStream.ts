import { useEffect, useRef } from 'react'
import type { NewsArticle } from '../types'

// Same logic as the Axios client — use the env var in prod, relative path in dev
const API_BASE = import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : '/api'

/**
 * useNewsStream
 * ─────────────
 * Opens an SSE connection to /api/news/{ticker}/stream.
 * Calls onNewArticles whenever the server pushes new items.
 *
 * The browser's native EventSource reconnects automatically if the
 * connection drops — no extra logic needed here.
 *
 * Cleans up (closes the connection) when ticker changes or on unmount.
 */
export function useNewsStream(
    ticker: string | null,
    onNewArticles: (articles: NewsArticle[]) => void
) {
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    if (!ticker) return

    const es = new EventSource(`${API_BASE}/news/${ticker}/stream`)
    esRef.current = es

    es.addEventListener('news', (e: MessageEvent) => {
      try {
        const articles: NewsArticle[] = JSON.parse(e.data)
        if (articles.length > 0) onNewArticles(articles)
      } catch {
        console.warn('Failed to parse SSE news payload', e.data)
      }
    })

    es.addEventListener('connected', () => {
      console.info(`[SSE] Connected to stream for ${ticker}`)
    })

    es.onerror = () => {
      console.warn(`[SSE] Connection error for ${ticker}, will retry...`)
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [ticker])
}