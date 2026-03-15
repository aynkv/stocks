package com.stockpulse.controller;

import com.stockpulse.model.NewsArticle;
import com.stockpulse.repository.NewsArticleRepository;
import com.stockpulse.service.NewsPollerService;
import com.stockpulse.service.SseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsArticleRepository newsArticleRepository;
    private final NewsPollerService newsPollerService;
    private final SseService sseService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    /**
     * Returns the 30 latest news articles for a given ticker.
     * On first call for a ticker, triggers an immediate fetch if no articles exist.
     */
    @GetMapping("/{ticker}")
    public ResponseEntity<List<NewsArticle>> getNews(@PathVariable String ticker) {
        String t = ticker.toUpperCase();
        List<NewsArticle> articles = newsArticleRepository.findTop30ByTickerOrderByPublishedAtDesc(t);

        if (articles.isEmpty()) {
            // First visit — fetch immediately so the user isn't staring at a blank screen
            String to   = LocalDate.now().format(DATE_FMT);
            String from = LocalDate.now().minusDays(7).format(DATE_FMT);
            articles = newsPollerService.pollStock(t, from, to);
        }

        return ResponseEntity.ok(articles);
    }

    /**
     * Opens an SSE stream for live news updates on a given ticker.
     *
     * The browser connects with:
     *   const source = new EventSource('/api/news/AAPL/stream');
     *   source.addEventListener('news', e => { ... });
     */
    @GetMapping(value = "/{ticker}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNews(@PathVariable String ticker) {
        return sseService.subscribe(ticker.toUpperCase());
    }
}
