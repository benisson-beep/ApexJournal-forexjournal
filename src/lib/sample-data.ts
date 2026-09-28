import { Trade, TradingAccount } from '../types/trade';

export const INITIAL_ACCOUNTS: TradingAccount[] = [
  {
    id: 'acc-main',
    name: 'Primary Account',
    broker: 'Broker',
    accountNumber: '—',
    server: 'Live / Demo',
    currency: 'USD',
    initialBalance: 10000,
    currentBalance: 10000,
    isLive: true,
    syncEnabled: false,
    lastSyncedAt: undefined,
  },
];

export const INITIAL_TRADES: Trade[] = [];
