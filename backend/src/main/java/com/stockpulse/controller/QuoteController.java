package com.stockpulse.controller;

import com.stockpulse.dto.PriceHistoryDTO;
import com.stockpulse.service.QuoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteService quoteService;

    /**
     * GET /api/quotes/{ticker}/history?range=30
     *
     * range param maps to days:
     *   7   → 1 week  (daily candles)
     *   30  → 1 month (daily candles)
     *   90  → 3 months (weekly candles)
     *   180 → 6 months (weekly candles)
     *   365 → 1 year   (weekly candles)
     */
    @GetMapping("/{ticker}/history")
    public ResponseEntity<PriceHistoryDTO> getPriceHistory(
            @PathVariable String ticker,
            @RequestParam(defaultValue = "30") int range) {

        // Clamp range to supported values
        int days = switch (range) {
            case 7   -> 7;
            case 90  -> 90;
            case 180 -> 180;
            case 365 -> 365;
            default  -> 30;
        };

        PriceHistoryDTO result = quoteService.getPriceHistory(ticker.toUpperCase(), days);
        return ResponseEntity.ok(result);
    }
}
