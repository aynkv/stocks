package com.stockpulse.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Current quote snapshot for a ticker.
 * Finnhub /quote endpoint fields: c=current, d=change, dp=change%, h=high, l=low, o=open, pc=prev close
 */
@Data
@Builder
public class QuoteDTO {
    private String ticker;
    private double current;
    private double change;
    private double changePercent;
    private double high;
    private double low;
    private double open;
    private double previousClose;
}
