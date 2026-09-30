'use client';

import React, { useMemo } from 'react';
import { Trade } from '../../types/trade';
import { getTradeDateStr } from '../../lib/analytics-math';
import {
  Calendar as CalendarIcon,
  Hash,
  BarChart3,
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

/**
 * Renders a semicircular arch gauge where green (wins) and red (losses)
 * arc lengths strictly depend on the dynamic win rate percentage.
 */
const SemiCircleGauge: React.FC<SemiCircleGaugeProps> = ({
  winRate,
  totalCount,
  centerLabel,
  centerValue,
}) => {
  const cx = 120;
  const cy = 120;
  const R = 85;
  const strokeWidth = 16;

  // Convert angle in degrees (180 = 9 o'clock, 90 = 12 o'clock, 0 = 3 o'clock) to SVG coordinates
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return {
      x: Number((cx + R * Math.cos(rad)).toFixed(2)),
      y: Number((cy - R * Math.sin(rad)).toFixed(2)),
    };
  };

  const renderArcs = () => {
    const pLeft = pt(180);
    const pRight = pt(0);

    // Empty state: neutral dark background track
    if (totalCount === 0) {
      return (
        <path
          d={`M ${pLeft.x} ${pLeft.y} A ${R} ${R} 0 0 1 ${pRight.x} ${pRight.y}`}
          fill="none"
          stroke="#262a34"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }

    // 100% win rate: full green arc
    if (winRate >= 100) {
      return (
        <path
          d={`M ${pLeft.x} ${pLeft.y} A ${R} ${R} 0 0 1 ${pRight.x} ${pRight.y}`}
          fill="none"
          stroke="#34d399"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }

    // 0% win rate: full red arc
    if (winRate <= 0) {
      return (
        <path
          d={`M ${pLeft.x} ${pLeft.y} A ${R} ${R} 0 0 1 ${pRight.x} ${pRight.y}`}
          fill="none"
          stroke="#f87171"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      );
    }

    // Dynamic split: arc length is proportional to the actual win rate
    const gap = 12; // gap in degrees between rounded caps to prevent overlapping
    const avail = 180 - gap;
    const clampedWinRate = Math.max(1, Math.min(99, winRate));
    const winDeg = (clampedWinRate / 100) * avail;

    const greenEnd = 180 - winDeg;
    const redStart = Math.max(0, greenEnd - gap);

    const pStartGreen = pt(180);
    const pEndGreen = pt(greenEnd);
    const pStartRed = pt(redStart);
    const pEndRed = pt(0);

    return (
      <>
        {/* Green arc for wins (starts at 180° on left, sweeps clockwise) */}
        <path
          d={`M ${pStartGreen.x} ${pStartGreen.y} A ${R} ${R} 0 0 1 ${pEndGreen.x} ${pEndGreen.y}`}
          fill="none"
          stroke="#34d399"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />

        {/* Red arc for losses (sweeps clockwise down to 0° on right) */}
        <path
          d={`M ${pStartRed.x} ${pStartRed.y} A ${R} ${R} 0 0 1 ${pEndRed.x} ${pEndRed.y}`}
          fill="none"
          stroke="#f87171"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
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
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1.5 pointer-events-none text-center">
        <span className="text-xs text-slate-400 font-sans font-medium">
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
  // Helper for direction matching
  const isSell = (t: Trade) => {
    const d = String(t.direction || '').toUpperCase();
    return d === 'SELL' || d.includes('SHORT');
  };

  const isBuy = (t: Trade) => {
    const d = String(t.direction || '').toUpperCase();
    return d === 'BUY' || d.includes('LONG');
  };

  // 1. Number of unique trading days
  const uniqueTradingDays = useMemo(() => {
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
  const totalLotsUsed = useMemo(() => {
    return trades.reduce((sum, t) => sum + (Number(t.lotSize) || 0), 0);
  }, [trades]);

  // 4. Biggest Win & Biggest Loss
  const wins = useMemo(() => trades.filter((t) => (t.netPnl || 0) > 0), [trades]);
  const losses = useMemo(() => trades.filter((t) => (t.netPnl || 0) < 0), [trades]);

  const biggestWin = wins.length > 0 ? Math.max(...wins.map((t) => t.netPnl)) : 0;
  const biggestLoss = losses.length > 0 ? Math.min(...losses.map((t) => t.netPnl)) : 0;

  // 5. Short Analysis (SELL trades)
  const shortTrades = useMemo(() => trades.filter(isSell), [trades]);
  const shortWins = useMemo(() => shortTrades.filter((t) => (t.netPnl || 0) > 0), [shortTrades]);
  const shortLosses = useMemo(() => shortTrades.filter((t) => (t.netPnl || 0) < 0), [shortTrades]);
  const shortTotal = shortTrades.length;
  const shortWinRate = shortTotal > 0 ? (shortWins.length / shortTotal) * 100 : 0;
  const shortProfit = useMemo(() => shortTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0), [shortTrades]);
  const shortGrossWins = useMemo(() => shortWins.reduce((sum, t) => sum + (t.netPnl || 0), 0), [shortWins]);
  const shortGrossLosses = useMemo(() => Math.abs(shortLosses.reduce((sum, t) => sum + (t.netPnl || 0), 0)), [shortLosses]);

  // 6. Overall Profitability
  const overallWinRate = totalTradesCount > 0 ? (wins.length / totalTradesCount) * 100 : 0;
  const overallLossRate = totalTradesCount > 0 ? (losses.length / totalTradesCount) * 100 : 0;

  // 7. Long Analysis (BUY trades)
  const longTrades = useMemo(() => trades.filter(isBuy), [trades]);
  const longWins = useMemo(() => longTrades.filter((t) => (t.netPnl || 0) > 0), [longTrades]);
  const longLosses = useMemo(() => longTrades.filter((t) => (t.netPnl || 0) < 0), [longTrades]);
  const longTotal = longTrades.length;
  const longWinRate = longTotal > 0 ? (longWins.length / longTotal) * 100 : 0;
  const longProfit = useMemo(() => longTrades.reduce((sum, t) => sum + (t.netPnl || 0), 0), [longTrades]);
  const longGrossWins = useMemo(() => longWins.reduce((sum, t) => sum + (t.netPnl || 0), 0), [longWins]);
  const longGrossLosses = useMemo(() => Math.abs(longLosses.reduce((sum, t) => sum + (t.netPnl || 0), 0)), [longLosses]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Top Metrics Grid (5 cards: 3 on top row, 2 on second row matching reference) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Card 1: Number of days */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium font-sans">Number of days</span>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-bold font-mono text-white">
            {uniqueTradingDays}
          </div>
        </div>

        {/* Card 2: Total Trades Taken */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Hash className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium font-sans">Total Trades Taken</span>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalTradesCount}
          </div>
        </div>

        {/* Card 3: Total Lots Used */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <BarChart3 className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium font-sans">Total Lots Used</span>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-bold font-mono text-white">
            {totalLotsUsed.toFixed(2)}
          </div>
        </div>

        {/* Card 4: Biggest Win */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium font-sans">Biggest Win</span>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-bold font-mono text-emerald-400">
            {biggestWin > 0
              ? `$${biggestWin.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0.00'}
          </div>
        </div>

        {/* Card 5: Biggest Loss */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingDown className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium font-sans">Biggest Loss</span>
          </div>
          <div className="mt-4 text-2xl sm:text-3xl font-bold font-mono text-rose-400">
            {biggestLoss < 0
              ? `-$${Math.abs(biggestLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '$0.00'}
          </div>
        </div>
      </div>

      {/* Semicircle Gauges Section (Short Analysis, Profitability, Long Analysis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {/* Gauge Card 1: Short Analysis */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
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

          <div className="pt-2 grid grid-cols-3 items-end text-xs">
            <div className="text-left">
              <span className="text-xs text-slate-400 font-sans block">
                Wins ({shortWins.length})
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                ${shortGrossWins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 font-sans block">
                Win Rate
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                {shortWinRate % 1 === 0 ? shortWinRate.toFixed(0) : shortWinRate.toFixed(2)}%
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-sans block">
                Losses ({shortLosses.length})
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                ${shortGrossLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Gauge Card 2: Profitability */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
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

          <div className="pt-2 grid grid-cols-2 text-center text-xs">
            <div>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block">
                {overallWinRate.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400 font-sans block mt-1">
                Wins: {wins.length}
              </span>
            </div>

            <div>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block">
                {overallLossRate.toFixed(2)}%
              </span>
              <span className="text-xs text-slate-400 font-sans block mt-1">
                Losses: {losses.length}
              </span>
            </div>
          </div>
        </div>

        {/* Gauge Card 3: Long Analysis */}
        <div className="bg-[#141418] border border-white/[0.05] rounded-2xl p-5 flex flex-col justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white font-sans tracking-tight">
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

          <div className="pt-2 grid grid-cols-3 items-end text-xs">
            <div className="text-left">
              <span className="text-xs text-slate-400 font-sans block">
                Wins ({longWins.length})
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                ${longGrossWins.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            <div className="text-center">
              <span className="text-xs text-slate-400 font-sans block">
                Win Rate
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                {longWinRate % 1 === 0 ? longWinRate.toFixed(0) : longWinRate.toFixed(2)}%
              </span>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-sans block">
                Losses ({longLosses.length})
              </span>
              <span className="text-xs sm:text-sm font-bold font-mono text-white block mt-1">
                ${longGrossLosses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
