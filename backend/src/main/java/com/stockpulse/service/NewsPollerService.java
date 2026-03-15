package com.stockpulse.service;

import com.stockpulse.event.NewsUpdateEvent;
import com.stockpulse.model.NewsArticle;
import com.stockpulse.model.Stock;
import com.stockpulse.repository.NewsArticleRepository;
import com.stockpulse.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Polls Finnhub on a fixed schedule for each tracked stock.
 * New articles are persisted and a NewsUpdateEvent is published
 * so the SseService can push them to connected clients.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NewsPollerService {

    private final FinnhubService finnhubService;
    private final StockRepository stockRepository;
    private final NewsArticleRepository newsArticleRepository;
    private final ApplicationEventPublisher eventPublisher;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Runs every 5 minutes (configurable via news.poll-interval-ms).
     * Iterates over every tracked stock and fetches news from the last 3 days.
     */
    @Scheduled(fixedDelayString = "${news.poll-interval-ms:300000}", initialDelay = 5000)
    public void pollAllStocks() {
        List<Stock> stocks = stockRepository.findAll();
        log.info("Polling news for {} stocks...", stocks.size());

        String to   = LocalDate.now().format(DATE_FMT);
        String from = LocalDate.now().minusDays(3).format(DATE_FMT);

        for (Stock stock : stocks) {
            pollStock(stock.getTicker(), from, to);
        }
    }

    /**
     * Fetches and persists news for a single ticker.
     * Called by the scheduler and can be called directly for on-demand refresh.
     */
    public List<NewsArticle> pollStock(String ticker, String from, String to) {
        List<Map<String, Object>> raw = finnhubService.fetchCompanyNews(ticker, from, to);
        List<NewsArticle> newArticles = new ArrayList<>();

        for (Map<String, Object> item : raw) {
            String url = (String) item.get("url");
            if (url == null || newsArticleRepository.existsByUrl(url)) continue;

            try {
                NewsArticle article = NewsArticle.builder()
                        .ticker(ticker)
                        .headline(truncate((String) item.get("headline"), 500))
                        .summary(truncate((String) item.get("summary"), 1000))
                        .url(url)
                        .source((String) item.get("source"))
                        .imageUrl((String) item.get("image"))
                        .publishedAt(toInstant(item.get("datetime")))
                        .build();

                newsArticleRepository.save(article);
                newArticles.add(article);
            } catch (Exception e) {
                log.warn("Skipping malformed article for {}: {}", ticker, e.getMessage());
            }
        }

        if (!newArticles.isEmpty()) {
            log.info("Saved {} new articles for {}", newArticles.size(), ticker);
            eventPublisher.publishEvent(new NewsUpdateEvent(this, ticker, newArticles));
        }

        return newArticles;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Instant toInstant(Object epochSeconds) {
        if (epochSeconds == null) return Instant.now();
        long epoch = ((Number) epochSeconds).longValue();
        return Instant.ofEpochSecond(epoch);
    }

    private String truncate(String value, int max) {
        if (value == null) return null;
        return value.length() > max ? value.substring(0, max) : value;
    }
}
