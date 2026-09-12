# 📈 ApexJournal — Institutional Forex Trading Journal SaaS

> **Institutional-grade Forex trading journal and performance analytics SaaS with real-time MT4/MT5 auto-sync, R-multiple tracking, and execution replay.**

---

## ⚡ Key Features

- **Institutional Dark Theme**: Deep obsidian surfaces, crisp 1px borders, and monospaced tabular figures. Zero AI slop, designed specifically for disciplined traders.
- **5 High-Density Core KPI Cards**:
  - Net Realized P&L with % account return.
  - Win Rate % with visual win/loss ratio distribution.
  - Profit Factor with automatic benchmark rating.
  - Realized R-Multiple average per trade.
  - Total volume in lots and total trade executions.
- **High-Density Trade Log Table**:
  - Filter by session (London, New York, Asian, Overlap).
  - Filter by direction (BUY / SELL) and outcome (Wins / Losses).
  - Search by instrument, ticket number, tags, or execution notes.
- **Fast Trade Logger Modal**:
  - Live calculation of pips and realized R-Multiple as you type entry, stop loss, and take profit.
  - Quick setup tagging (e.g., *Liquidity Sweep*, *Silver Bullet*, *Order Block Retest*).
  - Behavioral mistake tracking (e.g., *FOMO Entry*, *Moved Stop Loss*, *Overleveraged*).
- **Forex Math Engine**: Accurate pip valuation for standard pairs (`0.0001`), JPY pairs (`0.01`), Gold/XAUUSD, and Indices.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 🗺️ SaaS Roadmap

- [x] **Sprint 1**: Core High-Density Dashboard, Forex Math Engine, Trade Log, and Manual Entry Modal.
- [ ] **Sprint 2**: Real-time MT4/MT5 Sync EA (MQL5 Webhook) + Automated Statement CSV/HTML Parser.
- [ ] **Sprint 3**: Interactive P&L Calendar Heatmap & Psychological Mistake Analytics.
- [ ] **Sprint 4**: TradingView Candlestick Execution Replay (`@tradingview/lightweight-charts`).
- [ ] **Sprint 5**: Multi-Tenancy (Supabase Auth + PostgreSQL RLS) & Stripe Subscription Billing.

---

## 🛠️ Built With

- [Next.js 16 (App Router)](https://nextjs.org/)
- [React 19](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)
- [TypeScript](https://www.typescriptlang.org/)
