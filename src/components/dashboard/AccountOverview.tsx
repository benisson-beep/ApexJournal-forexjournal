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
    <div className="space-y-6">
      {/* 1. Account Portfolio Hub Card */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left: Account Identity & Primary Numbers */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white tracking-tight">
                {account.name}
              </h2>
              <span className="text-[10px] font-mono font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                #{account.accountNumber}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
                {account.broker}
              </span>
            </div>

            {/* Balances Strip */}
            <div className="flex flex-wrap items-baseline gap-6 pt-1">
              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
                  Current Balance
                </span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white tabular-nums">
                  ${account.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
                  Net Realized P&L
                </span>
                <span
                  className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                    isNetPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isNetPositive ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}{' '}
                  <span className="text-xs font-mono font-medium">
                    ({isNetPositive ? '+' : ''}{stats.pnlPercentage}%)
                  </span>
                </span>
              </div>

              <div>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-0.5">
                  Initial Capital
                </span>
                <span className="text-base sm:text-lg font-bold font-mono text-slate-300 tabular-nums">
                  ${account.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenNewTrade}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>Log Manual Trade</span>
            </button>

            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 bg-[#18181E] hover:bg-[#202027] border border-white/[0.06] hover:border-white/[0.12] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span>EA Webhook Sync</span>
            </button>
          </div>
        </div>

        {/* Multi-Account Switcher Bar */}
        {accounts.length > 1 && (
          <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mr-1">
              Switch Account:
            </span>
            {accounts.map((acc) => {
              const isCurrent = acc.id === account.id;
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-blue-600/10 border border-blue-500/25 text-white font-medium'
                      : 'bg-[#18181E] border border-white/[0.06] text-slate-400 hover:text-slate-200 hover:border-white/[0.12]'
                  }`}
                >
                  <span>{acc.name}</span>
                  <span className="font-mono text-[10px] text-slate-500">
                    ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Deep Institutional Quantitative Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Win Rate
          </span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {stats.winRate}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
            {stats.winningTrades}W · {stats.losingTrades}L · {stats.breakevenTrades}BE
          </span>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Profit Factor
          </span>
          <span
            className={`text-xl font-bold font-mono tabular-nums ${
              stats.profitFactor >= 1 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {stats.profitFactor >= 99 ? '∞' : stats.profitFactor}
          </span>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5 uppercase tracking-wide">
            {stats.profitFactor >= 2 ? 'Strong Edge' : stats.profitFactor >= 1 ? 'Profitable' : 'Unprofitable'}
          </span>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Avg Realized R:R
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            +{stats.avgRMultiple}R
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">per winning trade</span>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Max Drawdown
          </span>
          <span className="text-xl font-bold font-mono text-rose-400 tabular-nums">
            {stats.maxDrawdown}%
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Prop limit: 5%–10%</span>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Avg Winning Trade
          </span>
          <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
            +${stats.avgWin.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
            Loss avg: -${stats.avgLoss.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </span>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md">
          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
            Total Traded Lots
          </span>
          <span className="text-xl font-bold font-mono text-white tabular-nums">
            {stats.totalLots.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
            {stats.totalTrades} deals closed
          </span>
        </div>
      </div>

      {/* 3. Monthly P&L Calendar Consistency Heatmap */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
              Monthly P&L Calendar Consistency
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            Click day to inspect trades
          </span>
        </div>

        <CalendarHeatmap
          trades={trades}
          onSelectDay={onSelectDate}
          selectedDateStr={selectedDateStr}
        />
      </div>

      {/* 4. Discipline & Behavioral Edge / Setup Playbook Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: Cost of Mistakes */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
              Cost of Mistakes
            </h3>
            <span className="text-xs font-mono font-medium text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              -${totalMistakeLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Eliminating emotional mistakes would elevate clean P&L to{' '}
            <strong className="text-emerald-400 font-mono">
              +${cleanPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </strong>.
          </p>

          <div className="space-y-1.5 pt-1">
            {mistakes.slice(0, 3).map((m) => (
              <div
                key={m.name}
                className="bg-[#18181E] border border-white/[0.04] p-2.5 rounded-md flex items-center justify-between text-xs"
              >
                <span className="font-medium text-rose-300">#{m.name}</span>
                <div className="flex items-center gap-3 font-mono">
                  <span className="text-[11px] text-slate-500">{m.tradeCount} trades</span>
                  <span className="font-medium text-rose-400">
                    -${m.totalLost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Setup Playbook Top Edges */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
              Setup Playbook Edge
            </h3>
            <span className="text-xs font-mono text-slate-500">
              {setups.length} Defined Setups
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Realized performance by technical entry model.
          </p>

          <div className="space-y-1.5 pt-1">
            {setups.slice(0, 3).map((s) => (
              <div
                key={s.name}
                className="bg-[#18181E] border border-white/[0.04] p-2.5 rounded-md flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-medium text-slate-200 block">{s.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {s.winRate}% WR · +{s.avgRMultiple}R avg
                  </span>
                </div>
                <span className="text-emerald-400 font-mono font-medium">
                  +${s.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Recent Executions & Call-to-Action to Full Trade Log */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg overflow-hidden">
        <div className="p-3.5 px-4 border-b border-white/[0.06] flex items-center justify-between bg-[#18181E]">
          <div>
            <h3 className="text-xs sm:text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
              Recent Executions
            </h3>
          </div>

          <button
            onClick={onViewAllTrades}
            className="flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
          >
            <span>Full Execution Log ({trades.length} Deals)</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {recentTrades.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No trades logged for this account yet.
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04] text-xs">
            {recentTrades.map((t) => {
              const isWin = t.netPnl > 0;
              return (
                <div
                  key={t.id}
                  className="p-2.5 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white font-mono">{t.symbol}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                        t.direction === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {t.direction} {t.lotSize}L
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      {t.openPrice} $\rightarrow$ {t.closePrice}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-slate-500 font-mono hidden md:inline text-[11px]">
                      {t.pips >= 0 ? `+${t.pips}` : t.pips} pips
                    </span>
                    <span
                      className={`font-mono font-medium text-xs px-2 py-0.5 rounded ${
                        isWin
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
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
        <div className="p-3.5 bg-[#18181E] border-t border-white/[0.06] text-center">
          <button
            onClick={onViewAllTrades}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-5 py-2 rounded-md transition-colors cursor-pointer"
          >
            <span>Open Dedicated Trade Execution Log</span>
            <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};
