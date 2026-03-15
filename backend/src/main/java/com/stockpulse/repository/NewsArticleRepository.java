package com.stockpulse.repository;

import com.stockpulse.model.NewsArticle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NewsArticleRepository extends JpaRepository<NewsArticle, Long> {

    List<NewsArticle> findTop30ByTickerOrderByPublishedAtDesc(String ticker);

    Optional<NewsArticle> findByUrl(String url);

    boolean existsByUrl(String url);
}
