# StockPulse

Live stock news dashboard — Spring Boot backend + React frontend.

## Prerequisites

- Java 21+
- Maven 3.9+
- Node 20+
- A free [Finnhub](https://finnhub.io) API key

---

## Quick start (dev)

### 1. Backend

```bash
cd backend

# Set your Finnhub API key
export FINNHUB_API_KEY=your_key_here

# Run with H2 in-memory database (dev profile is active by default)
mvn spring-boot:run
```

Backend starts at **http://localhost:8080**  
H2 console available at **http://localhost:8080/h2-console** (JDBC URL: `jdbc:h2:mem:stockpulsedb`)

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**  
API calls are proxied to the backend automatically via Vite's proxy config.

---

## Project structure

```
stockpulse/
├── backend/
│   ├── src/main/java/com/stockpulse/
│   │   ├── StockPulseApplication.java     # Entry point
│   │   ├── config/
│   │   │   └── WebConfig.java             # CORS config
│   │   ├── controller/
│   │   │   ├── StockController.java       # GET /api/stocks
│   │   │   └── NewsController.java        # GET /api/news/{ticker} + SSE stream
│   │   ├── event/
│   │   │   └── NewsUpdateEvent.java       # Spring event for new articles
│   │   ├── model/
│   │   │   ├── Stock.java
│   │   │   └── NewsArticle.java
│   │   ├── repository/
│   │   │   ├── StockRepository.java
│   │   │   └── NewsArticleRepository.java
│   │   └── service/
│   │       ├── FinnhubService.java        # API client
│   │       ├── NewsPollerService.java     # @Scheduled poller
│   │       ├── SseService.java            # SSE emitter management
│   │       └── StockDataSeeder.java       # Seeds stocks on startup
│   └── src/main/resources/
│       └── application.yml               # H2 (dev) + PostgreSQL (prod) profiles
│
└── frontend/
    └── src/
        ├── api/          # Axios API client
        ├── components/   # React components
        ├── hooks/        # useNewsStream SSE hook
        ├── types/        # TypeScript types
        ├── App.tsx        # Main app shell
        └── main.tsx       # Entry point
```

---

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/stocks` | All seeded stocks |
| GET | `/api/stocks/search?q=` | Search stocks by name/ticker |
| GET | `/api/news/{ticker}` | Latest 30 articles for a ticker |
| GET | `/api/news/{ticker}/stream` | SSE stream for live updates |

---

## How SSE works in this project

1. Frontend selects a stock → opens `EventSource('/api/news/AAPL/stream')`
2. Spring's `SseService` creates an `SseEmitter` and registers it under `AAPL`
3. Every 5 minutes, `NewsPollerService` fetches fresh articles from Finnhub
4. New articles trigger a `NewsUpdateEvent` via Spring's `ApplicationEventPublisher`
5. `SseService` listens for the event and pushes the articles as a JSON payload to all connected emitters for that ticker
6. The frontend's `useNewsStream` hook receives the event and prepends new cards to the feed

---

## Production deployment

### Backend → Railway

1. Set environment variables: `FINNHUB_API_KEY`, `DATABASE_URL`, `DATABASE_USER`, `DATABASE_PASSWORD`
2. Set `SPRING_PROFILES_ACTIVE=prod`
3. Connect a PostgreSQL addon (Railway provides one free)
4. Deploy from the `/backend` directory

### Frontend → Vercel

1. Set `VITE_API_BASE_URL` to your Railway backend URL
2. Update `vite.config.ts` proxy target accordingly (or use env var in the Axios client)
3. Deploy from the `/frontend` directory

---

## Future roadmap

- [ ] Price chart (Recharts + Finnhub quote history)
- [ ] AI-generated news analysis (Claude API)
- [ ] User authentication (Spring Security + JWT)
- [ ] Financial statements panel
- [ ] Price alerts via WebSocket
