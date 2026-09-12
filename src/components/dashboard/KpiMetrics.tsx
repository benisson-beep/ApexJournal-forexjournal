'use client';

import React from 'react';
import { AccountStats } from '../../types/trade';
import { ArrowDownRight, ArrowUpRight, Award, BarChart2, DollarSign, Percent, Target } from 'lucide-react';

interface KpiMetricsProps {
  stats: AccountStats;
}

export const KpiMetrics: React.FC<KpiMetricsProps> = ({ stats }) => {
  const isPnlPositive = stats.netPnl >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {/* Metric 1: Net P&L */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Net Realized P&L</span>
          <div className={`p-1 rounded-md ${isPnlPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-2xl font-bold font-mono tabular-nums tracking-tight ${
              isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPnlPositive ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px]">
          <span
            className={`font-mono font-medium flex items-center ${
              isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPnlPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {isPnlPositive ? '+' : ''}{stats.pnlPercentage}%
          </span>
          <span className="text-slate-400">return on account</span>
        </div>
      </div>

      {/* Metric 2: Win Rate */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Win Rate</span>
          <div className="p-1 rounded-md bg-blue-500/10 text-blue-400">
            <Percent className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
            {stats.winRate}%
          </span>
          <span className="text-xs text-slate-400 font-mono">
            ({stats.winningTrades}W / {stats.losingTrades}L)
          </span>
        </div>
        {/* Win/Loss Progress Bar */}
        <div className="mt-3 w-full bg-[#1b2336] h-1.5 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${stats.winRate}%` }}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-500"
            style={{ width: `${100 - stats.winRate}%` }}
          />
        </div>
      </div>

      {/* Metric 3: Profit Factor */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Profit Factor</span>
          <div className="p-1 rounded-md bg-amber-500/10 text-amber-400">
            <BarChart2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
            {stats.profitFactor >= 99.99 ? '∞' : stats.profitFactor}
          </span>
          <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
            {stats.profitFactor >= 2 ? 'EXCELLENT' : stats.profitFactor >= 1.5 ? 'GOOD' : 'NORMAL'}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
          <span>Avg Win: <strong className="text-emerald-400 font-mono">${stats.avgWin}</strong></span>
          <span>·</span>
          <span>Avg Loss: <strong className="text-rose-400 font-mono">${stats.avgLoss}</strong></span>
        </div>
      </div>

      {/* Metric 4: Realized R-Multiple */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Avg Realized R:R</span>
          <div className="p-1 rounded-md bg-purple-500/10 text-purple-400">
            <Target className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
            {stats.avgRMultiple > 0 ? `+${stats.avgRMultiple}R` : `${stats.avgRMultiple}R`}
          </span>
          <span className="text-xs text-slate-400">per trade</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400">
          Max Drawdown: <span className="font-mono text-slate-300 font-medium">{stats.maxDrawdown}%</span>
        </div>
      </div>

      {/* Metric 5: Total Volume */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Total Volume</span>
          <div className="p-1 rounded-md bg-slate-500/10 text-slate-400">
            <Award className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-100 tracking-tight">
            {stats.totalTrades}
          </span>
          <span className="text-xs text-slate-400 font-medium">closed trades</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 font-mono">
          <span>{stats.totalLots} total lots executed</span>
        </div>
      </div>
    </div>
  );
};
