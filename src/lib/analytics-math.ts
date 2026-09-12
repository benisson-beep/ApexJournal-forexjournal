import { Trade, SessionType } from '../types/trade';

export interface DayPerformance {
  dateStr: string; // 'YYYY-MM-DD'
  dayNumber: number;
  netPnl: number;
  tradeCount: number;
  winningCount: number;
  losingCount: number;
  trades: Trade[];
}

export interface WeekPerformance {
  weekIndex: number;
  days: (DayPerformance | null)[];
  totalNetPnl: number;
  totalTrades: number;
}

export interface MistakeStat {
  name: string;
  totalLost: number;
  tradeCount: number;
  winRate: number;
}

export interface SetupStat {
  name: string;
  netPnl: number;
  tradeCount: number;
  winRate: number;
  profitFactor: number;
  avgRMultiple: number;
}

export interface SessionStat {
  session: SessionType;
  netPnl: number;
  tradeCount: number;
  winRate: number;
  profitFactor: number;
}

/**
 * Groups trades into a calendar month grid with weekly rollups
 */
export function buildMonthCalendar(trades: Trade[], year: number, month: number): WeekPerformance[] {
  // Map of date string -> DayPerformance
  const dayMap = new Map<string, DayPerformance>();

  for (const trade of trades) {
    const d = new Date(trade.closeTime);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const dateStr = d.toISOString().split('T')[0];
      const existing = dayMap.get(dateStr) || {
        dateStr,
        dayNumber: d.getDate(),
        netPnl: 0,
        tradeCount: 0,
        winningCount: 0,
        losingCount: 0,
        trades: [],
      };

      existing.netPnl = Number((existing.netPnl + trade.netPnl).toFixed(2));
      existing.tradeCount += 1;
      if (trade.netPnl > 0) existing.winningCount += 1;
      else if (trade.netPnl < 0) existing.losingCount += 1;
      existing.trades.push(trade);

      dayMap.set(dateStr, existing);
    }
  }

  // Days in month
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const totalDays = lastDay.getDate();

  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // In trading, week usually starts Monday (index 0)
  const getDayOfWeekIndex = (date: Date) => {
    const day = date.getDay();
    return day === 0 ? 6 : day - 1; // Mon = 0, Sun = 6
  };

  const weeks: WeekPerformance[] = [];
  let currentWeekDays: (DayPerformance | null)[] = [];
  let weekIndex = 1;

  // Pad beginning of first week
  const startDayOfWeek = getDayOfWeekIndex(firstDay);
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeekDays.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const curDate = new Date(year, month, day);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayData = dayMap.get(dateStr) || {
      dateStr,
      dayNumber: day,
      netPnl: 0,
      tradeCount: 0,
      winningCount: 0,
      losingCount: 0,
      trades: [],
    };

    currentWeekDays.push(dayData);

    if (currentWeekDays.length === 7) {
      const totalNetPnl = currentWeekDays.reduce((sum, d) => sum + (d ? d.netPnl : 0), 0);
      const totalTrades = currentWeekDays.reduce((sum, d) => sum + (d ? d.tradeCount : 0), 0);

      weeks.push({
        weekIndex,
        days: currentWeekDays,
        totalNetPnl: Number(totalNetPnl.toFixed(2)),
        totalTrades,
      });

      weekIndex++;
      currentWeekDays = [];
    }
  }

  // Pad end of last week
  if (currentWeekDays.length > 0) {
    while (currentWeekDays.length < 7) {
      currentWeekDays.push(null);
    }
    const totalNetPnl = currentWeekDays.reduce((sum, d) => sum + (d ? d.netPnl : 0), 0);
    const totalTrades = currentWeekDays.reduce((sum, d) => sum + (d ? d.tradeCount : 0), 0);

    weeks.push({
      weekIndex,
      days: currentWeekDays,
      totalNetPnl: Number(totalNetPnl.toFixed(2)),
      totalTrades,
    });
  }

  return weeks;
}

/**
 * Calculates behavioral mistake metrics ("Cost of Mistakes")
 */
export function calculateMistakeAnalytics(trades: Trade[]): {
  mistakes: MistakeStat[];
  totalMistakeLoss: number;
  cleanPnl: number;
} {
  const map = new Map<string, { totalLost: number; count: number; wins: number }>();
  let totalMistakeLoss = 0;

  for (const trade of trades) {
    const mistakeTags = trade.tags.filter((t) => t.type === 'MISTAKE');
    if (mistakeTags.length > 0) {
      if (trade.netPnl < 0) {
        totalMistakeLoss += Math.abs(trade.netPnl);
      }

      for (const tag of mistakeTags) {
        const existing = map.get(tag.name) || { totalLost: 0, count: 0, wins: 0 };
        existing.count += 1;
        if (trade.netPnl < 0) existing.totalLost += Math.abs(trade.netPnl);
        if (trade.netPnl > 0) existing.wins += 1;
        map.set(tag.name, existing);
      }
    }
  }

  const mistakes: MistakeStat[] = Array.from(map.entries())
    .map(([name, data]) => ({
      name,
      totalLost: Number(data.totalLost.toFixed(2)),
      tradeCount: data.count,
      winRate: Number(((data.wins / data.count) * 100).toFixed(1)),
    }))
    .sort((a, b) => b.totalLost - a.totalLost);

  const totalPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);
  const cleanPnl = Number((totalPnl + totalMistakeLoss).toFixed(2));

  return {
    mistakes,
    totalMistakeLoss: Number(totalMistakeLoss.toFixed(2)),
    cleanPnl,
  };
}

/**
 * Calculates statistical edge per Setup playbook
 */
export function calculateSetupAnalytics(trades: Trade[]): SetupStat[] {
  const map = new Map<
    string,
    { grossProfit: number; grossLoss: number; count: number; wins: number; totalR: number; rCount: number }
  >();

  for (const trade of trades) {
    const setupTags = trade.tags.filter((t) => t.type === 'SETUP');
    for (const tag of setupTags) {
      const existing = map.get(tag.name) || {
        grossProfit: 0,
        grossLoss: 0,
        count: 0,
        wins: 0,
        totalR: 0,
        rCount: 0,
      };

      existing.count += 1;
      if (trade.netPnl > 0) {
        existing.grossProfit += trade.netPnl;
        existing.wins += 1;
      } else if (trade.netPnl < 0) {
        existing.grossLoss += Math.abs(trade.netPnl);
      }

      if (trade.rMultiple !== undefined) {
        existing.totalR += trade.rMultiple;
        existing.rCount += 1;
      }

      map.set(tag.name, existing);
    }
  }

  return Array.from(map.entries())
    .map(([name, data]) => {
      const netPnl = data.grossProfit - data.grossLoss;
      const winRate = data.count > 0 ? (data.wins / data.count) * 100 : 0;
      const profitFactor =
        data.grossLoss > 0
          ? data.grossProfit / data.grossLoss
          : data.grossProfit > 0
          ? 99.99
          : 0;
      const avgRMultiple = data.rCount > 0 ? data.totalR / data.rCount : 0;

      return {
        name,
        netPnl: Number(netPnl.toFixed(2)),
        tradeCount: data.count,
        winRate: Number(winRate.toFixed(1)),
        profitFactor: Number(profitFactor.toFixed(2)),
        avgRMultiple: Number(avgRMultiple.toFixed(2)),
      };
    })
    .sort((a, b) => b.netPnl - a.netPnl);
}

/**
 * Calculates session comparison (London, New York, Asian, Overlap)
 */
export function calculateSessionAnalytics(trades: Trade[]): SessionStat[] {
  const sessions: SessionType[] = ['London', 'New York', 'Asian', 'Overlap'];
  return sessions.map((session) => {
    const sessionTrades = trades.filter((t) => t.session === session);
    const count = sessionTrades.length;
    let grossProfit = 0;
    let grossLoss = 0;
    let wins = 0;

    for (const t of sessionTrades) {
      if (t.netPnl > 0) {
        grossProfit += t.netPnl;
        wins++;
      } else if (t.netPnl < 0) {
        grossLoss += Math.abs(t.netPnl);
      }
    }

    const netPnl = grossProfit - grossLoss;
    const winRate = count > 0 ? (wins / count) * 100 : 0;
    const profitFactor =
      grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.99 : 0;

    return {
      session,
      netPnl: Number(netPnl.toFixed(2)),
      tradeCount: count,
      winRate: Number(winRate.toFixed(1)),
      profitFactor: Number(profitFactor.toFixed(2)),
    };
  });
}
