package com.stockpulse.service;

import com.stockpulse.dto.CandleDTO;
import com.stockpulse.dto.PriceHistoryDTO;
import com.stockpulse.dto.QuoteDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class QuoteService {

    private final WebClient finnhubClient;
    private final WebClient yahooClient;
    private final String apiKey;

    private static final DateTimeFormatter LABEL_FMT_SHORT = DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter LABEL_FMT_LONG  = DateTimeFormatter.ofPattern("MMM yy");

    public QuoteService(
            WebClient.Builder builder,
            @Value("${finnhub.base-url}") String finnhubBaseUrl,
            @Value("${finnhub.api-key}") String apiKey) {
        this.finnhubClient = builder.baseUrl(finnhubBaseUrl).build();
        // Yahoo Finance chart API — no auth required
        this.yahooClient = builder.baseUrl("https://query1.finance.yahoo.com").build();
        this.apiKey = apiKey;
    }

    public PriceHistoryDTO getPriceHistory(String ticker, int rangeDays) {
        QuoteDTO quote     = fetchQuote(ticker);
        List<CandleDTO> candles = fetchCandlesFromYahoo(ticker, rangeDays);

        // If we have candles, override the change/changePercent with
        // period-accurate values (first candle open → last candle close)
        if (!candles.isEmpty()) {
            double periodOpen  = candles.getFirst().getOpen();
            double periodClose = candles.getLast().getClose();
            double change      = periodClose - periodOpen;
            double changePct   = periodOpen != 0 ? (change / periodOpen) * 100 : 0;
            quote.setChange(change);
            quote.setChangePercent(changePct);
        }

        return PriceHistoryDTO.builder()
                .quote(quote)
                .candles(candles)
                .resolution(rangeDays <= 30 ? "D" : "W")
                .build();
    }

    // ── Finnhub current quote ─────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private QuoteDTO fetchQuote(String ticker) {
        try {
            Map<String, Object> r = finnhubClient.get()
                    .uri(u -> u.path("/quote")
                            .queryParam("symbol", ticker)
                            .queryParam("token", apiKey)
                            .build())
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (r == null) return emptyQuote(ticker);

            return QuoteDTO.builder()
                    .ticker(ticker)
                    .current(toDouble(r.get("c")))
                    .change(toDouble(r.get("d")))
                    .changePercent(toDouble(r.get("dp")))
                    .high(toDouble(r.get("h")))
                    .low(toDouble(r.get("l")))
                    .open(toDouble(r.get("o")))
                    .previousClose(toDouble(r.get("pc")))
                    .build();

        } catch (Exception e) {
            log.error("Finnhub quote failed for {}: {}", ticker, e.getMessage());
            return emptyQuote(ticker);
        }
    }

    // ── Yahoo Finance candle history ──────────────────────────────────────────

    /**
     * Uses Yahoo Finance's free chart API.
     * Endpoint: /v8/finance/chart/{ticker}?interval=1d&range=1mo
     *
     * No API key needed. Range maps to Yahoo interval/range params.
     */
    @SuppressWarnings("unchecked")
    private List<CandleDTO> fetchCandlesFromYahoo(String ticker, int rangeDays) {
        try {
            String range    = toYahooRange(rangeDays);
            String interval = rangeDays <= 30 ? "1d" : rangeDays <= 180 ? "1wk" : "1wk";

            Map<String, Object> response = yahooClient.get()
                    .uri(u -> u.path("/v8/finance/chart/" + ticker)
                            .queryParam("interval", interval)
                            .queryParam("range", range)
                            .build())
                    .header("User-Agent", "Mozilla/5.0")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) return List.of();

            // Navigate: response.chart.result[0]
            Map<String, Object> chart  = (Map<String, Object>) response.get("chart");
            List<Object>        result = (List<Object>) chart.get("result");
            if (result == null || result.isEmpty()) return List.of();

            Map<String, Object> data        = (Map<String, Object>) result.getFirst();
            List<Number>        timestamps  = (List<Number>) data.get("timestamp");
            Map<String, Object> indicators  = (Map<String, Object>) data.get("indicators");
            List<Object>        quoteList   = (List<Object>) indicators.get("quote");
            Map<String, Object> q           = (Map<String, Object>) quoteList.getFirst();

            List<Number> opens  = (List<Number>) q.get("open");
            List<Number> highs  = (List<Number>) q.get("high");
            List<Number> lows   = (List<Number>) q.get("low");
            List<Number> closes = (List<Number>) q.get("close");
            List<Number> vols   = (List<Number>) q.get("volume");

            if (timestamps == null || closes == null) return List.of();

            DateTimeFormatter fmt = rangeDays <= 90 ? LABEL_FMT_SHORT : LABEL_FMT_LONG;
            List<CandleDTO> candles = new ArrayList<>();

            for (int i = 0; i < timestamps.size(); i++) {
                // Skip nulls Yahoo sometimes includes at the end
                if (closes.get(i) == null) continue;

                long ts = timestamps.get(i).longValue();
                String label = Instant.ofEpochSecond(ts)
                        .atZone(ZoneOffset.UTC)
                        .format(fmt);

                candles.add(CandleDTO.builder()
                        .timestamp(ts)
                        .date(label)
                        .open(opens.get(i)  != null ? toDouble(opens.get(i))  : 0)
                        .high(highs.get(i)  != null ? toDouble(highs.get(i))  : 0)
                        .low(lows.get(i)    != null ? toDouble(lows.get(i))   : 0)
                        .close(toDouble(closes.get(i)))
                        .volume(vols != null && vols.get(i) != null ? vols.get(i).longValue() : 0)
                        .build());
            }

            log.info("Yahoo returned {} candles for {} (range={})", candles.size(), ticker, range);
            return candles;

        } catch (Exception e) {
            log.error("Yahoo candles failed for {}: {}", ticker, e.getMessage());
            return List.of();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    // TODO:
    //  Fix price up/down calculations
    //  Add candle/graph choice option
    //  Fix dates - bg to en
    private String toYahooRange(int days) {
        if (days <= 7)   return "5d";
        if (days <= 30)  return "1mo";
        if (days <= 90)  return "3mo";
        if (days <= 180) return "6mo";
        return "1y";
    }

    private QuoteDTO emptyQuote(String ticker) {
        return QuoteDTO.builder().ticker(ticker).build();
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        return ((Number) val).doubleValue();
    }
}