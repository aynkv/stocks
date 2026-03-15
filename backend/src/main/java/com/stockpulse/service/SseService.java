package com.stockpulse.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockpulse.event.NewsUpdateEvent;
import com.stockpulse.model.NewsArticle;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Manages Server-Sent Event (SSE) connections.
 *
 * HOW SSE WORKS (plain English):
 * ──────────────────────────────
 * 1. The frontend opens a persistent HTTP GET connection to /api/news/{ticker}/stream.
 * 2. Spring returns an SseEmitter instead of a normal response — this keeps the
 *    connection open and lets the server push data at any time.
 * 3. When new articles arrive (via NewsUpdateEvent), this service finds all emitters
 *    subscribed to that ticker and sends them the data.
 * 4. The browser's native EventSource API handles reconnection automatically if
 *    the connection drops.
 *
 * We store emitters in a ConcurrentHashMap<ticker → List<SseEmitter>> so multiple
 * browser tabs can each have their own connection.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SseService {

    // ticker → list of active emitters (multiple tabs may be open)
    private final Map<String, List<SseEmitter>> emitters = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper;

    /**
     * Creates and registers a new SseEmitter for the given ticker.
     * Called by NewsController when the frontend opens a stream connection.
     *
     * Timeout is 10 minutes — the frontend will reconnect automatically via EventSource.
     */
    public SseEmitter subscribe(String ticker) {
        SseEmitter emitter = new SseEmitter(10 * 60 * 1000L);

        emitters.computeIfAbsent(ticker.toUpperCase(), k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        log.info("SSE client subscribed to {}", ticker);

        // Clean up on completion / timeout / error
        Runnable cleanup = () -> removeEmitter(ticker, emitter);
        emitter.onCompletion(cleanup);
        emitter.onTimeout(cleanup);
        emitter.onError(e -> cleanup.run());

        // Send a heartbeat so the client knows the connection is live
        try {
            emitter.send(SseEmitter.event().name("connected").data("subscribed to " + ticker));
        } catch (IOException e) {
            log.warn("Failed to send initial heartbeat to {}", ticker);
        }

        return emitter;
    }

    /**
     * Listens for NewsUpdateEvents published by NewsPollerService.
     * Pushes new articles to all clients subscribed to that ticker.
     */
    @EventListener
    public void onNewsUpdate(NewsUpdateEvent event) {
        String ticker = event.getTicker().toUpperCase();
        List<SseEmitter> tickerEmitters = emitters.get(ticker);

        if (tickerEmitters == null || tickerEmitters.isEmpty()) {
            return; // nobody watching this ticker right now
        }

        try {
            String payload = objectMapper.writeValueAsString(
                    event.getNewArticles().stream().map(this::toDto).toList()
            );

            List<SseEmitter> dead = new CopyOnWriteArrayList<>();

            for (SseEmitter emitter : tickerEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("news").data(payload));
                } catch (IOException e) {
                    dead.add(emitter);
                }
            }

            tickerEmitters.removeAll(dead);
            log.debug("Pushed {} articles to {} SSE clients for {}", event.getNewArticles().size(), tickerEmitters.size(), ticker);

        } catch (Exception e) {
            log.error("Failed to push SSE update for {}: {}", ticker, e.getMessage());
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void removeEmitter(String ticker, SseEmitter emitter) {
        List<SseEmitter> list = emitters.get(ticker.toUpperCase());
        if (list != null) {
            list.remove(emitter);
            log.debug("SSE client disconnected from {}", ticker);
        }
    }

    private Map<String, Object> toDto(NewsArticle a) {
        return Map.of(
                "id",          a.getId(),
                "ticker",      a.getTicker(),
                "headline",    a.getHeadline() != null ? a.getHeadline() : "",
                "summary",     a.getSummary()  != null ? a.getSummary()  : "",
                "url",         a.getUrl(),
                "source",      a.getSource()   != null ? a.getSource()   : "",
                "imageUrl",    a.getImageUrl() != null ? a.getImageUrl() : "",
                "publishedAt", a.getPublishedAt().toString()
        );
    }
}
