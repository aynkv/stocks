package com.stockpulse.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Full response for GET /api/quotes/{ticker}/history
 * Contains the current quote snapshot plus the historical candles for the chart.
 */
@Data
@Builder
public class PriceHistoryDTO {
    private QuoteDTO quote;
    private List<CandleDTO> candles;
    private String resolution;  // "D", "W" etc. — what Finnhub used
}


