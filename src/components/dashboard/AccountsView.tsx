'use client';

import React from 'react';
import { TradingAccount, Trade } from '../../types/trade';
import { Zap, Upload, ArrowUpRight, Plus } from 'lucide-react';

interface AccountsViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  trades: Trade[];
  onOpenSyncModal: () => void;
  onOpenImportModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  trades,
  onOpenSyncModal,
  onOpenImportModal,
}) => {
  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalInitial = accounts.reduce((sum, a) => sum + a.initialBalance, 0);
  const totalPnl = totalBalance - totalInitial;
  const totalReturnPct = totalInitial > 0 ? (totalPnl / totalInitial) * 100 : 0;

  const renderSparkline = (acc: TradingAccount, accountTrades: Trade[]) => {
    let points: number[] = [acc.initialBalance];
    if (accountTrades.length >= 2) {
      const sortedTrades = [...accountTrades].sort(
        (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
      );
      let running = acc.initialBalance;
      sortedTrades.forEach((t) => {
        running += t.netPnl;
        points.push(running);
      });
    } else {
      const diff = acc.currentBalance - acc.initialBalance;
      points = [
        acc.initialBalance,
        acc.initialBalance + diff * 0.2,
        acc.initialBalance + diff * 0.6,
        acc.initialBalance + diff * 0.85,
        acc.currentBalance,
      ];
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const width = 140;
    const height = 28;
    const padding = 3;

    const pathD = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1)) * width;
        const y = height - padding - ((val - min) / range) * (height - padding * 2);
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

    const isProfit = acc.currentBalance >= acc.initialBalance;
    const strokeColor = isProfit ? '#10b981' : '#f43f5e';

    return (
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/[0.04]">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
          Equity Sparkline
        </span>
        <div className="w-[120px] h-6 flex items-center justify-end">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Title and Connect CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-heading font-bold tracking-tight text-white">
            Trading Accounts & Portfolios
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Institutional overview of connected broker accounts and real-time equity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#131317] hover:bg-[#18181E] border border-white/[0.06] hover:border-white/[0.12] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Connect MT4/MT5</span>
          </button>
        </div>
      </div>

      {/* 3 Summary Cards at Top: Visually lighter, borderless, subtle background tint, dominant number */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#131317] p-5 rounded-lg border-0">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Combined Equity
          </span>
          <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white tabular-nums">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {accounts.length} registered accounts
          </p>
        </div>

        <div className="bg-[#131317] p-5 rounded-lg border-0">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Aggregate Net P&L
          </span>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight tabular-nums ${
              totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p
            className={`text-[11px] font-mono mt-1 ${
              totalReturnPct >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'
            }`}
          >
            {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}% net return
          </p>
        </div>

        <div className="bg-[#131317] p-5 rounded-lg border-0">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-2">
            Active Workspace
          </span>
          <div className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight truncate">
            {accounts.find((a) => a.id === selectedAccountId)?.name || 'Default'}
          </div>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            Broker: {accounts.find((a) => a.id === selectedAccountId)?.broker}
          </p>
        </div>
      </div>

      {/* Account Cards Below: Visually heavier with hairline border & inline equity sparkline chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          const accountPnl = acc.currentBalance - acc.initialBalance;
          const pnlPct = acc.initialBalance > 0 ? (accountPnl / acc.initialBalance) * 100 : 0;
          const accountTrades = trades.filter((t) => t.accountId === acc.id);

          return (
            <div
              key={acc.id}
              className={`bg-[#18181E] border rounded-lg p-5 transition-colors relative ${
                isSelected
                  ? 'border-blue-500/40'
                  : 'border-white/[0.08] hover:border-white/[0.14]'
              }`}
            >
              {/* Top Row: Account Name & Status Badge with Dot Indicator */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white tracking-tight">{acc.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded text-slate-400 bg-white/[0.04] border border-white/[0.06]">
                      {acc.broker}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{acc.accountNumber} · Server: {acc.server}
                  </p>
                </div>

                {/* Status Badges styled as small text with dot indicator */}
                {isSelected ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Connected
                  </span>
                )}
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-[#131317] border border-white/[0.04] rounded-md">
                <div>
                  <span className="text-[10px] uppercase font-medium text-slate-400 block mb-0.5">
                    Current Balance
                  </span>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Initial: ${acc.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-medium text-slate-400 block mb-0.5">
                    Net Profit / Return
                  </span>
                  <span
                    className={`text-lg font-bold font-mono tabular-nums ${
                      accountPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {accountPnl >= 0 ? '+' : ''}${accountPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] block font-mono font-medium ${
                      pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Inline Equity Sparkline Chart */}
              {renderSparkline(acc, accountTrades)}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-white/[0.04]">
                <span className="text-xs text-slate-400 font-mono">
                  {accountTrades.length} trades recorded
                </span>

                {isSelected ? (
                  <span className="text-xs font-medium text-slate-400 bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 rounded-md cursor-default">
                    Currently Active
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectAccount(acc.id)}
                    className="flex items-center gap-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700 px-3 py-1.5 rounded-md transition-colors cursor-pointer"
                  >
                    <span>Switch Account</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Connect New Account Card */}
        <div
          onClick={onOpenSyncModal}
          className="border border-dashed border-white/[0.1] hover:border-blue-500/40 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[190px]"
        >
          <div className="w-8 h-8 rounded-md bg-white/[0.04] group-hover:bg-blue-500/10 border border-white/[0.08] group-hover:border-blue-500/25 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors mb-2.5">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">
            Connect Another Account
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
            Link an additional MT4, MT5, or prop firm account with real-time webhooks
          </p>
        </div>
      </div>
    </div>
  );
};
