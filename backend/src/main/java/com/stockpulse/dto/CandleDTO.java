package com.stockpulse.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Single OHLCV candle for the price history chart.
 * Finnhub /stock/candle returns parallel arrays — we zip them into these objects.
 */
@Data
@Builder
public class CandleDTO {
    private long timestamp;   // Unix epoch seconds
    private String date;      // Human-readable "MMM dd" for chart labels
    private double open;
    private double high;
    private double low;
    private double close;
    private long volume;
}
