# ApexJournal

Institutional Forex Trading Journal & Performance Analytics Terminal.

ApexJournal is a high-performance web terminal built for disciplined Forex, CFD, and prop firm traders. It provides automated trade synchronization from MetaTrader 4 and 5, behavioral execution analysis, P&L calendar tracking, and detailed statistical breakdowns.

---

## System Architecture

- **Frontend**: Next.js 16 (App Router with Turbopack), React 19, Tailwind CSS v4, Lucide Icons.
- **Backend & API**: Next.js Server Route Handlers for MetaTrader webhook synchronization and economic news ingestion.
- **Persistence Layer**: Dual-layer architecture with Supabase (PostgreSQL) and client-side LocalStorage cache for offline reliability.
- **External Integration**: Forex Factory JSON economic release ingestion with server-side caching.

---

## Core Modules

### 1. Account & Portfolio Management
- Multi-account tracking: Prop firm evaluations (Phase 1, Phase 2, Funded), Live Broker, and Demo accounts.
- Consolidated portfolio metrics and dedicated account inspection view.
- Real-time balance calculations, equity curve rendering, and max drawdown tracking.

### 2. Execution Logging & Trade Journal
- High-density data grid with multi-parameter filtering (symbol, session, trade direction, win/loss outcome).
- Inline trade editing and retrospective journaling with tag categorization (Setup tags vs. Behavioral mistakes).
- Automated pip and R-Multiple valuation supporting standard 4-digit pairs, JPY pairs, Gold (XAUUSD), and major equity indices.

### 3. Analytics & Performance Summaries
- Directional analysis: Segmented performance metrics and radial gauges for Short (Sell) vs. Long (Buy) positions.
- Daily & weekly P&L Calendar Heatmap with day-specific execution filtering.
- Behavioral discipline analysis: Quantifies the net financial impact of execution mistakes (e.g. FOMO, early closures, moving stops).

### 4. Economic Calendar
- Forex Factory calendar feed displaying market-moving events with currency and impact severity filtering (High, Medium, Low).
- Time status tracking distinguishing completed releases from pending catalysts.

---

## MetaTrader Webhook Integration

ApexJournal includes an Expert Advisor (EA) script for MetaTrader 4 (`ApexJournalSync.mq4`) and MetaTrader 5 (`ApexJournalSync.mq5`) located in `/public/downloads`.

- **Endpoint**: `/api/sync/trade`
- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: <ACCOUNT_API_KEY>`
- **Payload Schema**:
  ```json
  {
    "ticket": 74819201,
    "account_id": "acc-main",
    "symbol": "EURUSD",
    "type": "BUY",
    "lots": 2.5,
    "open_price": 1.08500,
    "close_price": 1.08850,
    "sl": 1.08300,
    "tp": 1.09000,
    "commission": -17.50,
    "swap": 0.0,
    "profit": 875.00,
    "open_time": "2026-09-30T08:15:00.000Z",
    "close_time": "2026-09-30T10:45:00.000Z",
    "comment": "NY Open Breakout"
  }
  ```

---

## Development Setup

### Prerequisites
- Node.js 18.18+ or 20+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/benisson-beep/ApexJournal-forexjournal.git
cd ApexJournal-forexjournal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Production Build

```bash
npm run build
npm run start
```
