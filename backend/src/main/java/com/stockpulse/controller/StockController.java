package com.stockpulse.controller;

import com.stockpulse.model.Stock;
import com.stockpulse.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockRepository stockRepository;

    /** Returns all stocks. Used to populate the full dropdown list. */
    @GetMapping
    public List<Stock> getAllStocks() {
        return stockRepository.findAll();
    }

    /** Search stocks by name or ticker. Used for the live search box. */
    @GetMapping("/search")
    public List<Stock> search(@RequestParam String q) {
        if (q == null || q.isBlank()) return stockRepository.findAll();
        return stockRepository.findByNameContainingIgnoreCaseOrTickerContainingIgnoreCase(q, q);
    }

    /** Get a single stock by ticker. */
    @GetMapping("/{ticker}")
    public ResponseEntity<Stock> getByTicker(@PathVariable String ticker) {
        return stockRepository.findAll().stream()
                .filter(s -> s.getTicker().equalsIgnoreCase(ticker))
                .findFirst()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
