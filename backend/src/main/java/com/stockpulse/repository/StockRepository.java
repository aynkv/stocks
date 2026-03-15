package com.stockpulse.repository;

import com.stockpulse.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockRepository extends JpaRepository<Stock, Long> {

    List<Stock> findByNameContainingIgnoreCaseOrTickerContainingIgnoreCase(
            String name, String ticker);
}
