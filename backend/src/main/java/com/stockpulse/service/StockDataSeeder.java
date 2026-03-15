package com.stockpulse.service;

import com.stockpulse.model.Stock;
import com.stockpulse.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds popular stock tickers into the database on startup if the table is empty.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StockDataSeeder implements CommandLineRunner {

    private final StockRepository stockRepository;

    @Override
    public void run(String... args) {
        if (stockRepository.count() > 0) {
            log.info("Stocks already seeded, skipping.");
            return;
        }

        List<Stock> stocks = List.of(
            // Technology
            Stock.builder().ticker("AAPL").name("Apple Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("MSFT").name("Microsoft Corporation").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("GOOGL").name("Alphabet Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("AMZN").name("Amazon.com Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("META").name("Meta Platforms Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("NVDA").name("NVIDIA Corporation").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("TSLA").name("Tesla Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("ORCL").name("Oracle Corporation").exchange("NYSE").sector("Technology").build(),
            Stock.builder().ticker("CRM").name("Salesforce Inc.").exchange("NYSE").sector("Technology").build(),
            Stock.builder().ticker("ADBE").name("Adobe Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("INTC").name("Intel Corporation").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("AMD").name("Advanced Micro Devices").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("NFLX").name("Netflix Inc.").exchange("NASDAQ").sector("Technology").build(),
            Stock.builder().ticker("UBER").name("Uber Technologies Inc.").exchange("NYSE").sector("Technology").build(),
            Stock.builder().ticker("SHOP").name("Shopify Inc.").exchange("NYSE").sector("Technology").build(),

            // Finance
            Stock.builder().ticker("JPM").name("JPMorgan Chase & Co.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("BAC").name("Bank of America Corp.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("GS").name("Goldman Sachs Group Inc.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("V").name("Visa Inc.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("MA").name("Mastercard Inc.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("BRK.B").name("Berkshire Hathaway Inc.").exchange("NYSE").sector("Finance").build(),
            Stock.builder().ticker("PYPL").name("PayPal Holdings Inc.").exchange("NASDAQ").sector("Finance").build(),

            // Healthcare
            Stock.builder().ticker("JNJ").name("Johnson & Johnson").exchange("NYSE").sector("Healthcare").build(),
            Stock.builder().ticker("PFE").name("Pfizer Inc.").exchange("NYSE").sector("Healthcare").build(),
            Stock.builder().ticker("UNH").name("UnitedHealth Group Inc.").exchange("NYSE").sector("Healthcare").build(),
            Stock.builder().ticker("ABBV").name("AbbVie Inc.").exchange("NYSE").sector("Healthcare").build(),
            Stock.builder().ticker("MRK").name("Merck & Co. Inc.").exchange("NYSE").sector("Healthcare").build(),

            // Energy
            Stock.builder().ticker("XOM").name("Exxon Mobil Corporation").exchange("NYSE").sector("Energy").build(),
            Stock.builder().ticker("CVX").name("Chevron Corporation").exchange("NYSE").sector("Energy").build(),

            // Consumer
            Stock.builder().ticker("WMT").name("Walmart Inc.").exchange("NYSE").sector("Consumer").build(),
            Stock.builder().ticker("KO").name("The Coca-Cola Company").exchange("NYSE").sector("Consumer").build(),
            Stock.builder().ticker("MCD").name("McDonald's Corporation").exchange("NYSE").sector("Consumer").build(),
            Stock.builder().ticker("SBUX").name("Starbucks Corporation").exchange("NASDAQ").sector("Consumer").build(),
            Stock.builder().ticker("NKE").name("Nike Inc.").exchange("NYSE").sector("Consumer").build(),
            Stock.builder().ticker("DIS").name("The Walt Disney Company").exchange("NYSE").sector("Consumer").build(),

            // Industrial / Other
            Stock.builder().ticker("BA").name("Boeing Company").exchange("NYSE").sector("Industrial").build(),
            Stock.builder().ticker("CAT").name("Caterpillar Inc.").exchange("NYSE").sector("Industrial").build(),
            Stock.builder().ticker("SPOT").name("Spotify Technology S.A.").exchange("NYSE").sector("Technology").build(),
            Stock.builder().ticker("COIN").name("Coinbase Global Inc.").exchange("NASDAQ").sector("Finance").build()
        );

        stockRepository.saveAll(stocks);
        log.info("Seeded {} stocks into the database.", stocks.size());
    }
}
