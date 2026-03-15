import { useEffect, useRef } from 'react'
import type { NewsArticle } from '../types'

/**
 * useNewsStream
 * ─────────────
 * Opens an SSE connection to /api/news/{ticker}/stream.
 * Calls onNewArticles whenever the server pushes new items.
 *
 * The browser's native EventSource will automatically reconnect
 * if the connection drops — no extra logic needed here.
 *
 * Cleans up (closes the connection) when ticker changes or component unmounts.
 */
export function useNewsStream(
  ticker: string | null,
  onNewArticles: (articles: NewsArticle[]) => void
) {
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Close any previous connection
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    if (!ticker) return

    const es = new EventSource(`/api/news/${ticker}/stream`)
    esRef.current = es

    // 'news' events carry JSON arrays of new articles
    es.addEventListener('news', (e: MessageEvent) => {
      try {
        const articles: NewsArticle[] = JSON.parse(e.data)
        if (articles.length > 0) {
          onNewArticles(articles)
        }
      } catch {
        console.warn('Failed to parse SSE news payload', e.data)
      }
    })

    es.addEventListener('connected', () => {
      console.info(`[SSE] Connected to stream for ${ticker}`)
    })

    es.onerror = () => {
      // EventSource handles reconnection automatically
      console.warn(`[SSE] Connection error for ${ticker}, will retry...`)
    }

    return () => {
      es.close()
      esRef.current = null
    }
  }, [ticker]) // re-run when ticker changes
}
