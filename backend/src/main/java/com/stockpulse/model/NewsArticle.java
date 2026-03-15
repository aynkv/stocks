package com.stockpulse.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Entity
@Table(name = "news_articles",
       uniqueConstraints = @UniqueConstraint(columnNames = {"url"}),
       indexes = {
           @Index(name = "idx_news_ticker", columnList = "ticker"),
           @Index(name = "idx_news_published", columnList = "publishedAt")
       })
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewsArticle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 10)
    private String ticker;

    @Column(nullable = false, length = 500)
    private String headline;

    @Column(length = 1000)
    private String summary;

    @Column(nullable = false, length = 1000)
    private String url;

    @Column(length = 200)
    private String source;

    @Column(length = 500)
    private String imageUrl;

    @Column(nullable = false)
    private Instant publishedAt;

    @Column(nullable = false, updatable = false)
    private Instant fetchedAt;

    @PrePersist
    public void prePersist() {
        if (fetchedAt == null) {
            fetchedAt = Instant.now();
        }
    }
}
