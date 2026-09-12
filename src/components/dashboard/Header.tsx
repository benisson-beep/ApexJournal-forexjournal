'use client';

import React from 'react';
import { TradingAccount } from '../../types/trade';
import { ChevronDown, Plus, RefreshCw, ShieldCheck, Zap } from 'lucide-react';

interface HeaderProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onOpenNewTrade: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onOpenNewTrade,
}) => {
  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  return (
    <header className="border-b border-[#1b2336] bg-[#080b11]/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & Account Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm tracking-tighter">
              AJ
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-100 text-base tracking-tight font-sans">
                  Apex<span className="text-emerald-400">Journal</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Institutional FX Analytics</p>
            </div>
          </div>

          <div className="h-5 w-px bg-[#1b2336] hidden md:block" />

          {/* Account Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-3 bg-[#0e131f] border border-[#1b2336] hover:border-[#242f48] transition-colors rounded-lg px-3 py-1.5 cursor-pointer">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-200">{currentAccount?.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">#{currentAccount?.accountNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <span>Balance:</span>
                  <span className="text-slate-200 font-semibold">
                    ${currentAccount?.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">{currentAccount?.broker}</span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute left-0 mt-1 w-64 bg-[#0e131f] border border-[#1b2336] rounded-lg shadow-2xl p-1.5 hidden group-hover:block z-50">
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">
                Connected Accounts
              </div>
              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc.id)}
                  className={`w-full text-left px-2.5 py-2 rounded-md text-xs transition-colors flex items-center justify-between ${
                    acc.id === selectedAccountId
                      ? 'bg-[#182030] text-emerald-400 font-medium border border-[#242f48]'
                      : 'text-slate-300 hover:bg-[#131929]'
                  }`}
                >
                  <div>
                    <p className="font-semibold text-slate-200">{acc.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ${acc.currentBalance.toLocaleString()} · {acc.broker}
                    </p>
                  </div>
                  {acc.id === selectedAccountId && (
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* MT4/MT5 Auto-Sync Status Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-[#0e131f] border border-[#1b2336] px-3 py-1.5 rounded-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">MT5 Webhook</span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              CONNECTED
            </span>
          </div>

          {/* Log Trade Button */}
          <button
            onClick={onOpenNewTrade}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] font-semibold text-xs px-3.5 py-2 rounded-lg transition-all shadow-lg shadow-emerald-500/10"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Log Trade</span>
          </button>
        </div>
      </div>
    </header>
  );
};
