import { Trade, AccountStats, Direction } from '../types/trade';

/**
 * Returns pip divisor/multiplier for a given Forex pair, index or commodity
 */
export function getPipValueMultiplier(symbol: string): number {
  const sym = symbol.toUpperCase().replace('/', '');
  if (sym.includes('JPY')) {
    return 100; // 0.01 = 1 pip
  }
  if (sym.includes('XAU') || sym.includes('GOLD')) {
    return 10; // 0.10 = 1 pip
  }
  if (sym.includes('US30') || sym.includes('NAS100') || sym.includes('SPX500') || sym.includes('GER40')) {
    return 1; // 1 point = 1 pip
  }
  return 10000; // standard 0.0001 = 1 pip (EURUSD, GBPUSD, etc.)
}

/**
 * Calculates pips between entry and exit
 */
export function calculatePips(symbol: string, direction: Direction, openPrice: number, closePrice: number): number {
  const mult = getPipValueMultiplier(symbol);
  const diff = direction === 'BUY' ? closePrice - openPrice : openPrice - closePrice;
  return Number((diff * mult).toFixed(1));
}

/**
 * Calculates realized R-Multiple: (Profit distance) / (Risk distance)
 */
export function calculateRMultiple(direction: Direction, openPrice: number, closePrice: number, stopLoss?: number): number | undefined {
  if (!stopLoss || stopLoss === 0) return undefined;
  
  const risk = direction === 'BUY' ? openPrice - stopLoss : stopLoss - openPrice;
  if (risk <= 0) return undefined; // Invalid SL placement
  
  const reward = direction === 'BUY' ? closePrice - openPrice : openPrice - closePrice;
  const r = reward / risk;
  return Number(r.toFixed(2));
}

/**
 * Aggregates high-density trading statistics for a list of trades
 */
export function calculateAccountStats(trades: Trade[], initialBalance: number = 100000): AccountStats {
  if (trades.length === 0) {
    return {
      netPnl: 0,
      pnlPercentage: 0,
      winRate: 0,
      profitFactor: 0,
      avgRMultiple: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      breakevenTrades: 0,
      totalLots: 0,
      avgWin: 0,
      avgLoss: 0,
      maxDrawdown: 0,
    };
  }

  let grossProfit = 0;
  let grossLoss = 0;
  let winningTrades = 0;
  let losingTrades = 0;
  let breakevenTrades = 0;
  let totalR = 0;
  let rCount = 0;
  let totalLots = 0;

  // Running balance for drawdown calculation
  let peakBalance = initialBalance;
  let currentBalance = initialBalance;
  let maxDrawdown = 0;

  // Sort trades by close time chronologically for drawdown calculation
  const sorted = [...trades].sort((a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime());

  for (const trade of sorted) {
    currentBalance += trade.netPnl;
    if (currentBalance > peakBalance) {
      peakBalance = currentBalance;
    } else {
      const dd = ((peakBalance - currentBalance) / peakBalance) * 100;
      if (dd > maxDrawdown) {
        maxDrawdown = dd;
      }
    }

    totalLots += trade.lotSize;

    if (trade.netPnl > 0) {
      grossProfit += trade.netPnl;
      winningTrades++;
    } else if (trade.netPnl < 0) {
      grossLoss += Math.abs(trade.netPnl);
      losingTrades++;
    } else {
      breakevenTrades++;
    }

    if (trade.rMultiple !== undefined) {
      totalR += trade.rMultiple;
      rCount++;
    }
  }

  const netPnl = grossProfit - grossLoss;
  const totalTrades = trades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.99 : 0;
  const avgRMultiple = rCount > 0 ? totalR / rCount : 0;
  const avgWin = winningTrades > 0 ? grossProfit / winningTrades : 0;
  const avgLoss = losingTrades > 0 ? grossLoss / losingTrades : 0;
  const pnlPercentage = (netPnl / initialBalance) * 100;

  return {
    netPnl: Number(netPnl.toFixed(2)),
    pnlPercentage: Number(pnlPercentage.toFixed(2)),
    winRate: Number(winRate.toFixed(1)),
    profitFactor: Number(profitFactor.toFixed(2)),
    avgRMultiple: Number(avgRMultiple.toFixed(2)),
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    totalLots: Number(totalLots.toFixed(2)),
    avgWin: Number(avgWin.toFixed(2)),
    avgLoss: Number(avgLoss.toFixed(2)),
    maxDrawdown: Number(maxDrawdown.toFixed(2)),
  };
}
