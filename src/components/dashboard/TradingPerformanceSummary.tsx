'use client';

import React from 'react';
import { Trade } from '../../types/trade';
import { getTradeDateStr } from '../../lib/analytics-math';
import {
  Calendar as CalendarIcon,
  Hash,
  BarChart2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface TradingPerformanceSummaryProps {
  trades: Trade[];
  className?: string;
}

interface SemiCircleGaugeProps {
  winRate: number; // 0 to 100
  totalCount: number;
  centerLabel: string;
  centerValue: string;
}

const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({
  winRate,
  totalCount,
  centerLabel,
  centerValue,
}) => {
  const cx = 120;
  const cy = 122;
  const R = 85;
  const strokeWidth = 20;

  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: cx + R * Math.cos(rad),
      y: cy - R * Math.sin(rad),
    };
  };

  const renderArcs = () => {
    const p1 = pt(180);
    const p2 = pt(0);

    if (totalCount === 0) {
      return (
        <path
          d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`}
          fill="none"
          stroke="#262a34"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      );
    }

    if (winRate >= 100) {
      return (
        <path
          d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      );
    }

    if (winRate <= 0) {
      return (
        <path
          d={`M ${p1.x} ${p1.y} A ${R} ${R} 0 0 1 ${p2.x} ${p2.y}`}
          fill="none"
          stroke="#f87171"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      );
    }

    const gap = 3.5; // degrees gap between segments
    const winDeg = (winRate / 100) * 180;
    const safeWinDeg = Math.max(gap + 1, Math.min(180 - (gap + 1), winDeg));

    const greenEnd = 180 - safeWinDeg + gap / 2;
    const redStart = 180 - safeWinDeg - gap / 2;

    const pStartGreen = pt(180);
    const pEndGreen = pt(greenEnd);
    const pStartRed = pt(redStart);
    const pEndRed = pt(0);

    return (
      <>
        {/* Green arc for wins (left side clockwise) */}
        <path
          d={`M ${pStartGreen.x} ${pStartGreen.y} A ${R} ${R} 0 0 1 ${pEndGreen.x} ${pEndGreen.y}`}
          fill="none"
          stroke="#22c55e"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
        {/* Red arc for losses (clockwise down to 0) */}
        <path
          d={`M ${pStartRed.x} ${pStartRed.y} A ${R} ${R} 0 0 1 ${pEndRed.x} ${pEndRed.y}`}
          fill="none"
          stroke="#f87171"
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
        />
      </>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full">
      <svg
        viewBox="0 0 240 135"
        className="w-full max-w-[240px] h-auto overflow-visible"
      >
        {renderArcs()}
      </svg>
      {/* Center Label & Metric */}
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-2 pointer-events-none text-center">
        <span className="text-xs text-slate-400 font-medium">
          {centerLabel}
        </span>
        <span className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight mt-0.5">
          {centerValue}
        </span>
      </div>
    </div>
  );
};

export const TradingPerformanceSummary: React.FC<TradingPerformanceSummaryProps> = ({
  trades,
  className = '',
}) => {
  // 1. Number of unique trading days
  const uniqueTradingDays = React.useMemo(() => {
    const days = new Set(
      trades
        .filter((t) => t.closeTime)
        .map((t) => getTradeDateStr(t))
        .filter(Boolean)
    );
    return days.size;
  }, [trades]);

  // 2. Total Trades Taken
  const totalTradesCount = trades.length;

  // 3. Total Lots Used
  const totalLots = trades.reduce((sum, t) => sum + (Number(t.lotSize) || 0), 0);

  // 4. Biggest Win & Biggest Loss
  const wins = trades.filter((t) => (t.netPnl || 0) > 0);
  const losses = trades.filter((t) => (t.netPnl || 0) < 0);

  const biggestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.netPnl)) : 0;
  const biggestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.netPnl)) : 0;

  // 5. Short Analysis (SELL trades)
  const shortTrades = trades.filter((t) => t.direction === 'SELL');
  const shortWins = shortTrades.filter((t) => (t.netPnl || 0) > 0);
  const shortLosses = shortTrades.filter((t) => (t.netPnl || 0) < 0);
  const shortTotal = shortTrades.length;
  const shortWinRate = shortTotal > 0 ? (shortWins.length / shortTotal) * 100 : 0;
  const shortProfit = shortTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const shortGrossWins = shortWins.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const shortGrossLosses = Math.abs(shortLosses.reduce((sum, t) => sum + (t.netPnl || 0), 0));

  // 6. Overall Profitability
  const overallWinRate = totalTradesCount > 0 ? (wins.length / totalTradesCount) * 100 : 0;
  const overallLossRate = totalTradesCount > 0 ? (losses.length / totalTradesCount) * 100 : 0;

  // 7. Long Analysis (BUY trades)
  const longTrades = trades.filter((t) => t.direction === 'BUY');
  const longWins = longTrades.filter((t) => (t.netPnl || 0) > 0);
  const longLosses = longTrades.filter((t) => (t.netPnl || 0) < 0);
  const longTotal = longTrades.length;
  const longWinRate = longTotal > 0 ? (longWins.length / longTotal) * 100 : 0;
  const longProfit = longTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const longGrossWins = longWins.reduce((sum, t) => sum + (t.netPnl || 0), 0);
  const longGrossLosses = Math.abs(longLosses.reduce((sum, t) => sum + (t.netPnl || 0), 0));

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Quick Metrics Grid (Row 1: 3 cards, Row 2: 2 cards matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Card 1: Number of days */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Number of days</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold font-mono text-white">
            {uniqueTradingDays}
          </div>
        </div>

        {/* Card 2: Total Trades Taken */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Hash className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Total Trades Taken</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalTradesCount}
          </div>
        </div>

        {/* Card 3: Total Lots Used */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart2 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Total Lots Used</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalLots.toFixed(2)}
          </div>
        </div>

        {/* Card 4: Biggest Win */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Biggest Win</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {biggestWin > 0 ? `$${biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
          </div>
        </div>

        {/* Card 5: Biggest Loss */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium">Biggest Loss</span>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-bold font-mono text-rose-400">
            {biggestLoss < 0 ? `-$${Math.abs(biggestLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'}
          </div>
        </div>
      </div>

      {/* Gauges Section (Row 3: Short Analysis, Profitability, Long Analysis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Gauge Card 1: Short Analysis */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Short Analysis
          </h3>

          <div className="my-4">
            <SemiCircleGauge
              winRate={shortWinRate}
              totalCount={shortTotal}
              centerLabel="Profit"
              centerValue={`${shortProfit < 0 ? '-' : ''}$${Math.abs(shortProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>

          <div className="pt-2 grid grid-cols-3 items-end">
            <div className="text-left">
              <span className="text-xs text-slate-400 block">
                Wins ({shortWins.length})
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                ${shortGrossWins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 block">
                Win Rate
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                {shortWinRate % 1 === 0 ? shortWinRate.toFixed(0) : shortWinRate.toFixed(2)}%
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                Losses ({shortLosses.length})
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                ${shortGrossLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Gauge Card 2: Profitability */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Profitability
          </h3>

          <div className="my-4">
            <SemiCircleGauge
              winRate={overallWinRate}
              totalCount={totalTradesCount}
              centerLabel="Total Trades"
              centerValue={String(totalTradesCount)}
            />
          </div>

          <div className="pt-2 grid grid-cols-2 text-center">
            <div>
              <span className="text-sm font-bold font-mono text-slate-200 block">
                {overallWinRate.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Wins: {wins.length}
              </span>
            </div>

            <div>
              <span className="text-sm font-bold font-mono text-slate-200 block">
                {overallLossRate.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400 block mt-1">
                Losses: {losses.length}
              </span>
            </div>
          </div>
        </div>

        {/* Gauge Card 3: Long Analysis */}
        <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-5 flex flex-col justify-between">
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Long Analysis
          </h3>

          <div className="my-4">
            <SemiCircleGauge
              winRate={longWinRate}
              totalCount={longTotal}
              centerLabel="Profit"
              centerValue={`${longProfit < 0 ? '-' : ''}$${Math.abs(longProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
          </div>

          <div className="pt-2 grid grid-cols-3 items-end">
            <div className="text-left">
              <span className="text-xs text-slate-400 block">
                Wins ({longWins.length})
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                ${longGrossWins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 block">
                Win Rate
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                {longWinRate % 1 === 0 ? longWinRate.toFixed(0) : longWinRate.toFixed(2)}%
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">
                Losses ({longLosses.length})
              </span>
              <span className="text-sm font-bold font-mono text-slate-200 block mt-1">
                ${longGrossLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
