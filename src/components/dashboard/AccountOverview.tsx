'use client';

import React from 'react';
import { Trade, TradingAccount, AccountStats } from '../../types/trade';
import { CalendarHeatmap } from './CalendarHeatmap';
import {
  calculateMistakeAnalytics,
  calculateSetupAnalytics,
} from '../../lib/analytics-math';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
  Zap,
} from 'lucide-react';

interface AccountOverviewProps {
  account: TradingAccount;
  accounts: TradingAccount[];
  onSelectAccount: (id: string) => void;
  stats: AccountStats;
  trades: Trade[];
  onViewAllTrades: () => void;
  onOpenNewTrade: () => void;
  onOpenSyncModal: () => void;
  onSelectDate: (dateStr: string | null) => void;
  selectedDateStr: string | null;
}

export const AccountOverview: React.FC<AccountOverviewProps> = ({
  account,
  accounts,
  onSelectAccount,
  stats,
  trades,
  onViewAllTrades,
  onOpenNewTrade,
  onOpenSyncModal,
  onSelectDate,
  selectedDateStr,
}) => {
  const { mistakes, totalMistakeLoss, cleanPnl } = calculateMistakeAnalytics(trades);
  const setups = calculateSetupAnalytics(trades);

  // Recent 4 executed trades
  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime())
    .slice(0, 4);

  const isNetPositive = stats.netPnl >= 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Account Portfolio Hub Card */}
      <div className="bg-black border border-white/10 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Account Identity & Primary Numbers */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {account.name}
              </h2>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                #{account.accountNumber}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 bg-white/5 border border-white/10 px-2 py-0.5 rounded">
                {account.broker}
              </span>
            </div>

            {/* Balances Strip */}
            <div className="flex flex-wrap items-baseline gap-6 pt-1">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Current Balance
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white tabular-nums">
                  ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Net Realized P&L
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-black font-mono tabular-nums ${
                    isNetPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isNetPositive ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-sm font-bold font-sans">
                    ({isNetPositive ? '+' : ''}{stats.pnlPercentage}%)
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Initial Capital
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-300 tabular-nums">
                  ${account.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenNewTrade}
              className="flex items-center gap-1.5 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Log Manual Trade</span>
            </button>

            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 bg-[#080c14] hover:bg-[#101624] border border-white/10 hover:border-emerald-500/40 text-slate-200 font-semibold text-xs px-3.5 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span>EA Webhook Sync</span>
            </button>
          </div>
        </div>

        {/* Multi-Account Switcher Bar */}
        {accounts.length > 1 && (
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Switch Account:
            </span>
            {accounts.map((acc) => {
              const isCurrent = acc.id === account.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-white/10 border border-emerald-500/50 text-white font-bold'
                      : 'bg-[#080c14] border border-white/10 text-slate-400 hover:text-slate-200 hover:border-white/20'
                  }`}
                >
                  <span>{acc.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">
                    ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Deep Institutional Quantitative Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Win Rate
          </span>
          <span className="text-xl font-black font-mono text-white tabular-nums">
            {stats.winRate}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
            {stats.winningTrades}W · {stats.losingTrades}L · {stats.breakevenTrades}BE
          </span>
        </div>

        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Profit Factor
          </span>
          <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
            {stats.profitFactor >= 99 ? '∞' : stats.profitFactor}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block mt-0.5 uppercase tracking-wide">
            {stats.profitFactor >= 2 ? 'EXCELLENT EDGE' : stats.profitFactor >= 1 ? 'PROFITABLE' : 'UNPROFITABLE'}
          </span>
        </div>

        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Realized R:R
          </span>
          <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
            +{stats.avgRMultiple}R
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">per winning trade</span>
        </div>

        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Drawdown
          </span>
          <span className="text-xl font-black font-mono text-rose-400 tabular-nums">
            {stats.maxDrawdown}%
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Prop limit: 5%–10%</span>
        </div>

        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Avg Winning Trade
          </span>
          <span className="text-xl font-black font-mono text-emerald-400 tabular-nums">
            +${stats.avgWin.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
            Loss avg: -${stats.avgLoss.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-black border border-white/10 p-3.5 rounded-lg">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Traded Lots
          </span>
          <span className="text-xl font-black font-mono text-white tabular-nums">
            {stats.totalLots.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
            {stats.totalTrades} closed deals
          </span>
        </div>
      </div>

      {/* 3. Monthly P&L Calendar Consistency Heatmap */}
      <div className="bg-black border border-white/10 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Monthly P&L Calendar Consistency
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Click any green/red day to inspect executed trades
          </span>
        </div>

        <CalendarHeatmap
          trades={trades}
          onSelectDay={onSelectDate}
          selectedDateStr={selectedDateStr}
        />
      </div>

      {/* 4. Discipline & Behavioral Edge / Setup Playbook Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Cost of Mistakes */}
        <div className="bg-black border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Cost of Mistakes
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              -${totalMistakeLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminating emotional mistakes would elevate your clean P&L to{' '}
            <strong className="text-emerald-400 font-mono font-bold">
              +${cleanPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>.
          </p>

          <div className="space-y-2 pt-1">
            {mistakes.slice(0, 3).map((m) => (
              <div
                key={m.name}
                className="bg-[#080c14] border border-white/10 p-2.5 rounded-lg flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-rose-300">#{m.name}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[11px] text-slate-400">{m.tradeCount} trades</span>
                  <span className="font-bold text-rose-400">
                    -${m.totalLost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Setup Playbook Top Edges */}
        <div className="bg-black border border-white/10 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                Setup Playbook Edge
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {setups.length} Defined Setups
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Realized performance by technical model and entry trigger.
          </p>

          <div className="space-y-2 pt-1">
            {setups.slice(0, 3).map((s) => (
              <div
                key={s.name}
                className="bg-[#080c14] border border-white/10 p-2.5 rounded-lg flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200 block">{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.winRate}% WR · +{s.avgRMultiple}R avg
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-bold">
                  +${s.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Executions & Call-to-Action to Full Trade Log */}
      <div className="bg-black border border-white/10 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 px-5 border-b border-white/10 flex items-center justify-between bg-[#080c14]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
              Recent Executions
            </h3>
          </div>

          <button
            onClick={onViewAllTrades}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <span>Open Full Trade Execution Log ({trades.length} Deals)</span>
            <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No trades logged for this account yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10 text-xs">
            {recentTrades.map((t) => {
              const isWin = t.netPnl > 0;
              return (
                <div
                  key={t.id}
                  className="p-3 px-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white font-mono">{t.symbol}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase font-mono ${
                        t.direction === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {t.direction} {t.lotSize}L
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                      {t.openPrice} $\rightarrow$ {t.closePrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-400 font-mono hidden md:inline text-[11px]">
                      {t.pips >= 0 ? `+${t.pips}` : t.pips} pips
                    </span>
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        isWin
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isWin ? '+' : ''}${t.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Big Bottom Action Bar */}
        <div className="p-4 bg-[#080c14] border-t border-white/10 text-center">
          <button
            onClick={onViewAllTrades}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs px-7 py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <span>Go to Dedicated Trade Execution Log Table</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
};
