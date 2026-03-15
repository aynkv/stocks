package com.stockpulse.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Thin wrapper around the Finnhub REST API.
 * Docs: https://finnhub.io/docs/api/company-news
 */
@Service
@Slf4j
public class FinnhubService {

    private final WebClient webClient;
    private final String apiKey;

    public FinnhubService(
            WebClient.Builder builder,
            @Value("${finnhub.base-url}") String baseUrl,
            @Value("${finnhub.api-key}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    /**
     * Fetches company news for a given ticker from Finnhub.
     * Returns a list of raw article maps from the JSON response.
     *
     * @param ticker  stock ticker symbol, e.g. "AAPL"
     * @param from    date string "YYYY-MM-DD"
     * @param to      date string "YYYY-MM-DD"
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchCompanyNews(String ticker, String from, String to) {
        try {
            List<Map<String, Object>> response = webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/company-news")
                            .queryParam("symbol", ticker)
                            .queryParam("from", from)
                            .queryParam("to", to)
                            .queryParam("token", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(List.class)
                    .block();

            if (response == null) return List.of();
            log.debug("Finnhub returned {} articles for {}", response.size(), ticker);
            return response;

        } catch (Exception e) {
            log.error("Failed to fetch news from Finnhub for ticker {}: {}", ticker, e.getMessage());
            return List.of();
        }
    }
}
