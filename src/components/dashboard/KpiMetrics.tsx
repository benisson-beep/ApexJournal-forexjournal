'use client';

import React from 'react';
import { AccountStats } from '../../types/trade';

interface KpiMetricsProps {
  stats: AccountStats;
  initialBalance?: number;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ stats, initialBalance = 0 }) => {
  const isPnlPositive = stats.netPnl > 0;
  const isPnlNegative = stats.netPnl < 0;

  // Format Net P&L
  const formatNetPnl = () => {
    if (isPnlPositive) {
      return `+$${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (isPnlNegative) {
      return `-$${Math.abs(stats.netPnl).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$0.00`;
  };

  // Format Profit Factor cleanly without NaN/Infinity
  const renderProfitFactor = () => {
    if (stats.totalTrades === 0) {
      return { value: '0.00', color: 'text-slate-300', note: 'No trades yet' };
    }
    if (stats.losingTrades === 0 && stats.winningTrades > 0) {
      return { value: '∞', color: 'text-emerald-400', note: 'Undefeated · 0 losses' };
    }
    if (stats.winningTrades === 0 && stats.losingTrades > 0) {
      return { value: '0.00', color: 'text-rose-400', note: 'No winning trades' };
    }
    const color = stats.profitFactor >= 1.0 ? 'text-emerald-400' : 'text-rose-400';
    const note = stats.profitFactor >= 2 ? 'Strong Edge' : stats.profitFactor >= 1 ? 'Profitable' : 'Unprofitable';
    return { value: stats.profitFactor.toFixed(2), color, note };
  };

  const pfData = renderProfitFactor();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
      {/* 1. Net P&L */}
      <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Net P&L
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${
              isPnlPositive ? 'text-emerald-400' : isPnlNegative ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {formatNetPnl()}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
          {initialBalance > 0
            ? `${isPnlPositive ? '+' : ''}${stats.pnlPercentage.toFixed(2)}% on capital`
            : stats.totalTrades === 0
            ? 'No executions'
            : 'Net realized P&L'}
        </span>
      </div>

      {/* 2. Win Rate */}
      <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Win Rate
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
            {stats.totalTrades > 0 ? stats.winRate.toFixed(1) : '0.0'}%
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
          {stats.winningTrades}W · {stats.losingTrades}L
        </span>
      </div>

      {/* 3. Profit Factor */}
      <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Profit Factor
          </span>
          <span className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${pfData.color}`}>
            {pfData.value}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
          {pfData.note}
        </span>
      </div>

      {/* 4. Max Drawdown */}
      <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Max Drawdown
          </span>
          <span
            className={`text-xl sm:text-2xl font-bold font-mono tabular-nums tracking-tight ${
              stats.maxDrawdown > 0 ? 'text-rose-400' : 'text-slate-100'
            }`}
          >
            {stats.maxDrawdown.toFixed(2)}%
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
          Peak-to-trough decline
        </span>
      </div>

      {/* 5. Total Trades */}
      <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md flex flex-col justify-between">
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Trades
          </span>
          <span className="text-xl sm:text-2xl font-bold font-mono text-slate-100 tabular-nums tracking-tight">
            {stats.totalTrades}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono mt-1 block">
          {stats.totalTrades === 1 ? '1 closed trade' : `${stats.totalTrades} closed trades`}
        </span>
      </div>
    </div>
  );
};
