export type Direction = 'BUY' | 'SELL';

export type SessionType = 'London' | 'New York' | 'Asian' | 'Overlap';

export type TradeStatus = 'WIN' | 'LOSS' | 'BE';

export interface TradeTag {
  id: string;
  name: string;
  type: 'SETUP' | 'MISTAKE' | 'CUSTOM';
}

export interface Trade {
  id: string;
  ticket: string;
  accountId: string;
  symbol: string;
  direction: Direction;
  lotSize: number;
  openPrice: number;
  closePrice: number;
  stopLoss?: number;
  takeProfit?: number;
  pips: number;
  grossPnl: number;
  commission: number;
  swap: number;
  netPnl: number;
  rMultiple?: number;
  status: TradeStatus;
  openTime: string;
  closeTime: string;
  session: SessionType;
  tags: TradeTag[];
  notes?: string;
  chartUrl?: string;
}

export type AccountCategory = 'PROP_CHALLENGE' | 'PROP_FUNDED' | 'LIVE_BROKER' | 'DEMO';
export type AccountStatus = 'ACTIVE' | 'PASSED' | 'BREACHED' | 'ARCHIVED';

export interface TradingAccount {
  id: string;
  name: string;
  broker: string;
  accountNumber: string;
  server: string;
  currency: string;
  initialBalance: number;
  currentBalance: number;
  isLive: boolean;
  syncEnabled: boolean;
  lastSyncedAt?: string;
  accountType?: AccountCategory;
  phase?: string;
  status?: AccountStatus;
  platform?: string;
  environment?: string;
  accountSize?: number;
}

export interface AccountStats {
  netPnl: number;
  pnlPercentage: number;
  winRate: number;
  profitFactor: number;
  avgRMultiple: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakevenTrades: number;
  totalLots: number;
  avgWin: number;
  avgLoss: number;
  maxDrawdown: number;
}

export type ForexNewsImpact = 'High' | 'Medium' | 'Low' | 'Holiday';

export interface ForexNewsEvent {
  id?: string;
  title: string;
  country: string;
  date: string; // ISO 8601 string, e.g. "2026-09-30T08:30:00-04:00"
  impact: ForexNewsImpact | string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

export interface NewsCalendarResponse {
  success: boolean;
  source: string;
  lastUpdated: string;
  cached: boolean;
  events: ForexNewsEvent[];
  error?: string;
}

