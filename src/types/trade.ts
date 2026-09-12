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
