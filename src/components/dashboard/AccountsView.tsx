'use client';

import React from 'react';
import { TradingAccount, Trade } from '../../types/trade';
import {
  Wallet,
  CheckCircle2,
  Zap,
  Upload,
  ArrowUpRight,
  TrendingUp,
  Building2,
  ShieldCheck,
  Plus,
} from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header with Title and Connect CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span>Trading Accounts & Portfolios</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your connected prop firm challenges, live broker accounts, and real-time equity
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#080c14] hover:bg-[#101624] border border-white/10 hover:border-white/25 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Connect MT4/MT5</span>
          </button>
        </div>
      </div>

      {/* Portfolio Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#080c14] border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Combined Equity</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white">
            ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Across {accounts.length} active trading accounts</p>
        </div>

        <div className="bg-[#080c14] border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Aggregate Net P&L</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-2xl font-black font-mono ${totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-emerald-400 font-mono mt-1">
            {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}% overall return
          </p>
        </div>

        <div className="bg-[#080c14] border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Workspace</span>
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-lg font-bold text-slate-200 truncate">
            {accounts.find((a) => a.id === selectedAccountId)?.name || 'Default'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            Broker: {accounts.find((a) => a.id === selectedAccountId)?.broker}
          </p>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map((acc) => {
          const isSelected = acc.id === selectedAccountId;
          const accountPnl = acc.currentBalance - acc.initialBalance;
          const pnlPct = acc.initialBalance > 0 ? (accountPnl / acc.initialBalance) * 100 : 0;
          const accountTradeCount = trades.filter((t) => t.accountId === acc.id).length;

          return (
            <div
              key={acc.id}
              className={`bg-[#080c14] border rounded-2xl p-5 transition-all relative ${
                isSelected
                  ? 'border-emerald-500/50 ring-1 ring-emerald-500/30'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {/* Top Row: Name & Status */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">{acc.name}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-semibold">
                      {acc.broker}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Account #{acc.accountNumber} · Server: {acc.server}
                  </p>
                </div>

                {isSelected ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACTIVE</span>
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded">
                    Connected
                  </span>
                )}
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-black/40 border border-white/5 rounded-xl">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Current Balance</span>
                  <span className="text-lg font-black font-mono text-white">
                    ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Initial: ${acc.initialBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Net Profit / Return</span>
                  <span
                    className={`text-lg font-black font-mono ${
                      accountPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {accountPnl >= 0 ? '+' : ''}${accountPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`text-[10px] block font-mono font-bold ${
                      pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-400 font-mono">
                  {accountTradeCount} trades logged
                </span>

                {isSelected ? (
                  <button
                    disabled
                    className="text-xs font-bold text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg cursor-default"
                  >
                    Currently Viewing
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectAccount(acc.id)}
                    className="flex items-center gap-1.5 text-xs font-bold text-black bg-[#00c97b] hover:bg-emerald-400 px-3.5 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    <span>Switch to Account</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Connect New Account Card */}
        <div
          onClick={onOpenSyncModal}
          className="bg-[#080c14]/50 border border-dashed border-white/15 hover:border-emerald-500/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[190px]"
        >
          <div className="w-10 h-10 rounded-xl bg-white/5 group-hover:bg-emerald-500/15 border border-white/10 group-hover:border-emerald-500/30 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors mb-3">
            <Plus className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-200 group-hover:text-white">Connect Another Account</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Link an additional MT4, MT5, cTrader, or prop firm account with real-time webhooks
          </p>
        </div>
      </div>
    </div>
  );
};
