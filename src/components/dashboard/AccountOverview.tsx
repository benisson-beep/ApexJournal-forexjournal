'use client';

import React from 'react';
import { Trade, TradingAccount, AccountStats } from '../../types/trade';
import { CalendarHeatmap } from './CalendarHeatmap';
import { KpiMetrics } from './KpiMetrics';
import { EquityCurve } from './EquityCurve';
import { calculateAccountStats } from '../../lib/forex-math';
import {
  calculateMistakeAnalytics,
  calculateSetupAnalytics,
} from '../../lib/analytics-math';
import {
  ArrowRight,
  Plus,
  Wallet,
  Zap,
} from 'lucide-react';

interface AccountOverviewProps {
  account?: TradingAccount | null;
  accounts: TradingAccount[];
  onSelectAccount: (id: string) => void;
  stats: AccountStats;
  trades: Trade[];
  onViewAllTrades: () => void;
  onOpenNewTrade: () => void;
  onOpenSyncModal: () => void;
  onSelectDate: (dateStr: string | null) => void;
  selectedDateStr: string | null;
  onNavigateToAccounts?: () => void;
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
  onNavigateToAccounts,
}) => {
  const { mistakes, totalMistakeLoss, cleanPnl } = calculateMistakeAnalytics(trades);
  const setups = calculateSetupAnalytics(trades);

  // Recent 4 executed trades
  const recentTrades = [...trades]
    .sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime())
    .slice(0, 4);

  // Calculate KPI stats respecting selectedDateStr filter if one exists
  const kpiStats = React.useMemo(() => {
    if (!selectedDateStr) {
      return stats;
    }
    const filteredTrades = trades.filter((t) => t.closeTime.startsWith(selectedDateStr));
    return calculateAccountStats(filteredTrades, account?.initialBalance || 0);
  }, [trades, selectedDateStr, stats, account?.initialBalance]);

  if (!account) {
    return (
      <div className="space-y-6">
        <div className="bg-[#131317] border border-white/[0.08] rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Wallet className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-xl font-heading font-bold text-white tracking-tight">
              No Trading Account Connected
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              Connect your MT4/MT5 broker, evaluation account, or live portfolio to begin journaling executions and tracking performance.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            {onNavigateToAccounts && (
              <button
                onClick={onNavigateToAccounts}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Configure Trading Account</span>
              </button>
            )}
            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-2 bg-[#18181E] hover:bg-[#22222a] border border-white/[0.08] text-slate-200 font-medium text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
            >
              <Zap className="w-4 h-4 text-slate-400" strokeWidth={1.5} />
              <span>Connect EA Webhook</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Redesigned 5-Card Institutional KPI Metrics */}
      <KpiMetrics stats={kpiStats} initialBalance={account.initialBalance} />

      {/* 2. Large Equity Curve Section directly underneath KPI Cards */}
      <EquityCurve
        account={account}
        trades={trades}
        selectedDateStr={selectedDateStr}
      />

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

          {mistakes.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 bg-[#18181E]/50 border border-white/[0.04] rounded-md">
              No emotional mistakes logged. Maintain disciplined risk rules!
            </div>
          ) : (
            <>
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
            </>
          )}
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

          {setups.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 bg-[#18181E]/50 border border-white/[0.04] rounded-md">
              No setup entry models logged yet. Tag your trades to measure edge.
            </div>
          ) : (
            <>
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
            </>
          )}
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
