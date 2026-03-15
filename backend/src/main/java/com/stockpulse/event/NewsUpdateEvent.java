package com.stockpulse.event;

import com.stockpulse.model.NewsArticle;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.List;

/**
 * Published by NewsPollerService when new articles are fetched for a ticker.
 * SseService listens and pushes these to all connected clients watching that ticker.
 */
@Getter
public class NewsUpdateEvent extends ApplicationEvent {

    private final String ticker;
    private final List<NewsArticle> newArticles;

    public NewsUpdateEvent(Object source, String ticker, List<NewsArticle> newArticles) {
        super(source);
        this.ticker = ticker;
        this.newArticles = newArticles;
    }
}
