'use client';

import React, { useMemo } from 'react';
import { Trade } from '../../types/trade';

interface ExecutionStatsProps {
  trades: Trade[];
}

export const ExecutionStats: React.FC<ExecutionStatsProps> = ({ trades }) => {
  // 1. Trading Week Performance Data
  const weekData = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sun, 1 is Mon...
    const sunday = new Date(now);
    sunday.setDate(now.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0);

    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    saturday.setHours(23, 59, 59, 999);

    const days = [
      { key: 0, label: 'Sun', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
      { key: 1, label: 'Mon', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
      { key: 2, label: 'Tue', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
      { key: 3, label: 'Wed', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
      { key: 4, label: 'Thu', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
      { key: 5, label: 'Fri', pnl: 0, count: 0, winPnl: 0, lossPnl: 0 },
    ];

    let totalThisWeek = 0;

    trades.forEach((t) => {
      try {
        const d = new Date(t.closeTime);
        if (d >= sunday && d <= saturday) {
          const dow = d.getDay();
          if (dow >= 0 && dow <= 5) {
            days[dow].pnl += t.netPnl;
            days[dow].count += 1;
            if (t.netPnl > 0) {
              days[dow].winPnl += t.netPnl;
            } else {
              days[dow].lossPnl += Math.abs(t.netPnl);
            }
            totalThisWeek += t.netPnl;
          }
        }
      } catch {
        // ignore
      }
    });

    const maxAbs = Math.max(
      ...days.map((d) => Math.max(Math.abs(d.pnl), d.winPnl, d.lossPnl)),
      100
    );

    return { days, totalThisWeek, maxAbs };
  }, [trades]);

  // 2. Session Win Rates Data
  const sessionData = useMemo(() => {
    const sessions = [
      { name: 'New York', matchKeys: ['new york', 'ny'], wins: 0, total: 0 },
      { name: 'London', matchKeys: ['london'], wins: 0, total: 0 },
      { name: 'Asia', matchKeys: ['asian', 'asia', 'tokyo'], wins: 0, total: 0 },
    ];

    trades.forEach((t) => {
      const sess = (t.session || '').toLowerCase();
      sessions.forEach((s) => {
        if (s.matchKeys.some((k) => sess.includes(k))) {
          s.total += 1;
          if (t.netPnl > 0) s.wins += 1;
        }
      });
    });

    return sessions.map((s) => {
      const winRate = s.total > 0 ? (s.wins / s.total) * 100 : 0;
      return {
        name: s.name,
        total: s.total,
        winRate: Number(winRate.toFixed(1)),
      };
    });
  }, [trades]);

  // 3. Profitability Data
  const profitability = useMemo(() => {
    const total = trades.length;
    const won = trades.filter((t) => t.netPnl > 0).length;
    const lost = trades.filter((t) => t.netPnl < 0).length;
    const wonPct = total > 0 ? Math.round((won / total) * 100) : 0;
    const lostPct = total > 0 ? Math.round((lost / total) * 100) : 0;

    return { total, won, lost, wonPct, lostPct };
  }, [trades]);

  // 4. Most Traded Instruments Data
  const topInstruments = useMemo(() => {
    const counts: Record<string, number> = {};
    trades.forEach((t) => {
      const sym = (t.symbol || 'EURUSD').toUpperCase();
      counts[sym] = (counts[sym] || 0) + 1;
    });

    const total = trades.length;
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // If fewer than 3, fill with default placeholders so layout matches 3 rings
    const defaults = ['EURUSD', 'GBPUSD', 'USDJPY'];
    while (sorted.length < 3) {
      const fallbackSym = defaults[sorted.length] || 'XAUUSD';
      if (!sorted.some(([s]) => s === fallbackSym)) {
        sorted.push([fallbackSym, 0]);
      } else {
        sorted.push([`PAIR-${sorted.length + 1}`, 0]);
      }
    }

    return sorted.map(([symbol, count]) => {
      const pct = total > 0 && count > 0 ? Number(((count / total) * 100).toFixed(2)) : 0;
      return {
        symbol,
        count,
        pct,
      };
    });
  }, [trades]);

  // Currency formatter for week P&L values
  const formatPnl = (val: number) => {
    if (val === 0) return '$0.00';
    const isNeg = val < 0;
    const abs = Math.abs(val);
    let str = '';
    if (abs >= 1000) {
      str = `$${(abs / 1000).toFixed(1)}k`;
    } else {
      str = `$${abs >= 10 ? Math.round(abs) : abs.toFixed(1)}`;
    }
    return isNeg ? `-${str}` : str;
  };

  const formatWeekTotal = (val: number) => {
    const isNeg = val < 0;
    const abs = Math.abs(val);
    const kStr = abs >= 1000 ? `${(abs / 1000).toFixed(1)}k` : `${abs.toFixed(0)}`;
    return isNeg ? `-$${kStr}` : `$${kStr}`;
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-heading">
          EXECUTION STATS
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          Portfolio Summation (All Accounts)
        </span>
      </div>

      {/* 2x2 Grid of Institutional Execution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================
            CARD 1: TRADING WEEK PERFORMANCE
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-heading">
              TRADING WEEK PERFORMANCE
            </span>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Total this week
              </span>
              <span
                className={`text-lg sm:text-xl font-bold font-mono tracking-tight ${
                  weekData.totalThisWeek >= 0 ? 'text-white' : 'text-slate-100'
                }`}
              >
                {formatWeekTotal(weekData.totalThisWeek)}
              </span>
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="mt-8 pt-4 pb-2">
            <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-40">
              {weekData.days.map((day) => {
                const absVal = Math.abs(day.pnl);
                // Proportional height between 8% and 92%
                const barHeightPct =
                  absVal > 0
                    ? Math.max(12, Math.min(92, Math.round((absVal / weekData.maxAbs) * 85) + 10))
                    : 4;

                const secondBarHeight =
                  absVal > 0 ? Math.max(8, Math.min(96, Math.round(barHeightPct * 1.15))) : 4;

                return (
                  <div key={day.key} className="flex flex-col items-center h-full justify-end group">
                    {/* Value above bars */}
                    <span className="text-[11px] font-mono text-slate-300 font-semibold mb-2 tabular-nums">
                      {formatPnl(day.pnl)}
                    </span>

                    {/* Paired Vertical Bars */}
                    <div className="flex items-end gap-1 w-full justify-center h-28">
                      <div
                        style={{ height: `${barHeightPct}%` }}
                        className="w-2.5 sm:w-3 bg-blue-700 hover:bg-blue-600 rounded-t-sm transition-all duration-300"
                        title={`${day.label}: ${formatPnl(day.pnl)} (${day.count} trades)`}
                      />
                      <div
                        style={{ height: `${secondBarHeight}%` }}
                        className="w-2.5 sm:w-3 bg-blue-800 hover:bg-blue-600 rounded-t-sm transition-all duration-300"
                        title={`${day.label}: ${formatPnl(day.pnl)} (${day.count} trades)`}
                      />
                    </div>

                    {/* Day Label */}
                    <span className="text-xs text-slate-400 font-medium mt-2">
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 2: SESSION WIN RATES
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-heading">
              SESSION WIN RATES
            </span>
          </div>

          <div className="space-y-6 mt-6">
            {sessionData.map((session) => (
              <div key={session.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">
                    {session.name}
                  </span>
                  <span className="font-mono font-bold text-white text-sm tabular-nums">
                    {session.winRate > 0 ? `${session.winRate.toFixed(1)}%` : '0.0%'}
                  </span>
                </div>

                {/* Horizontal Progress Track */}
                <div className="h-6 w-full bg-[#18181E] border border-white/[0.04] rounded-md overflow-hidden p-0.5">
                  <div
                    style={{ width: `${Math.max(session.winRate > 0 ? session.winRate : 0, 0)}%` }}
                    className="h-full bg-blue-700 rounded transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================
            CARD 3: PROFITABILITY
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-heading">
              PROFITABILITY
            </span>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                Total Trades
              </span>
              <span className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
                {profitability.total}
              </span>
            </div>
          </div>

          {/* Won / Lost Statistics */}
          <div className="mt-8 pt-4">
            <div className="flex items-end justify-between">
              {/* Won */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">Won</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-heading text-white">
                    {profitability.won}
                  </span>
                  <span className="text-sm sm:text-base font-semibold font-mono text-slate-300">
                    {profitability.wonPct}%
                  </span>
                </div>
              </div>

              {/* Lost */}
              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">Lost</span>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-2xl sm:text-3xl font-bold font-heading text-white">
                    {profitability.lost}
                  </span>
                  <span className="text-sm sm:text-base font-semibold font-mono text-slate-300">
                    {profitability.lostPct}%
                  </span>
                </div>
              </div>
            </div>

            {/* Split Distribution Bar */}
            <div className="mt-4 h-2.5 w-full bg-[#18181E] rounded-full overflow-hidden flex">
              <div
                style={{ width: `${profitability.wonPct}%` }}
                className="bg-blue-600 h-full transition-all duration-500"
              />
              <div
                style={{ width: `${profitability.lostPct}%` }}
                className="bg-slate-700 h-full transition-all duration-500"
              />
            </div>
          </div>
        </div>

        {/* ========================================================
            CARD 4: MOST TRADED INSTRUMENTS
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-heading">
              MOST TRADED INSTRUMENTS
            </span>
          </div>

          {/* Three Circular Donut Gauges */}
          <div className="mt-6 flex items-center justify-around gap-2">
            {topInstruments.map((item, idx) => {
              const radius = 38;
              const circumference = 2 * Math.PI * radius;
              // Stroke dash offset calculation
              const strokeDashoffset = circumference - (item.pct / 100) * circumference;

              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Gauge Container */}
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Background Circle Track */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="rgba(255, 255, 255, 0.05)"
                        strokeWidth="7"
                        fill="none"
                      />
                      {/* Active Progress Arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        stroke="#2563eb"
                        strokeWidth="7"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="none"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Centered Percentage */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold font-mono text-white tracking-tight">
                        {item.pct > 0 ? `${item.pct.toFixed(1)}%` : '0.0%'}
                      </span>
                    </div>
                  </div>

                  {/* Instrument Symbol Below */}
                  <span className="mt-2 text-xs font-bold font-mono text-slate-200">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {item.count} {item.count === 1 ? 'trade' : 'trades'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
