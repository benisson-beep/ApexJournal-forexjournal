'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../components/dashboard/Header';
import { KpiMetrics } from '../components/dashboard/KpiMetrics';
import { TradeTable } from '../components/dashboard/TradeTable';
import { NewTradeModal } from '../components/dashboard/NewTradeModal';
import { INITIAL_ACCOUNTS, INITIAL_TRADES } from '../lib/sample-data';
import { calculateAccountStats } from '../lib/forex-math';
import { Trade, TradingAccount } from '../types/trade';
import { Calendar, Download, RefreshCw, Upload } from 'lucide-react';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filter trades for the selected account
  const accountTrades = useMemo(() => {
    return trades.filter((t) => t.accountId === selectedAccountId);
  }, [trades, selectedAccountId]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Dynamic portfolio stats calculation
  const stats = useMemo(() => {
    return calculateAccountStats(accountTrades, selectedAccount.initialBalance);
  }, [accountTrades, selectedAccount]);

  const handleSaveTrade = (newTrade: Trade) => {
    setTrades([newTrade, ...trades]);

    // Update account balance
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === newTrade.accountId) {
          return {
            ...acc,
            currentBalance: Number((acc.currentBalance + newTrade.netPnl).toFixed(2)),
          };
        }
        return acc;
      })
    );
  };

  const handleDeleteTrade = (id: string) => {
    const tradeToDelete = trades.find((t) => t.id === id);
    if (!tradeToDelete) return;

    setTrades((prev) => prev.filter((t) => t.id !== id));

    // Reverse the balance impact
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tradeToDelete.accountId) {
          return {
            ...acc,
            currentBalance: Number((acc.currentBalance - tradeToDelete.netPnl).toFixed(2)),
          };
        }
        return acc;
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Institutional Navigation Header */}
      <Header
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
        onOpenNewTrade={() => setIsModalOpen(true)}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-6 space-y-6">
        {/* Section: Subheader & Quick Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100">
              Performance Analytics & Journal
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Account: <span className="text-slate-300 font-medium">{selectedAccount.name}</span> · Real-time statistical edge monitoring
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#0e131f] hover:bg-[#131929] border border-[#1b2336] text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-slate-400" />
              <span>Import MT4/MT5 CSV</span>
            </button>
            <div className="flex items-center gap-1 bg-[#0e131f] border border-[#1b2336] text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>September 2026</span>
            </div>
          </div>
        </div>

        {/* Section: 5 KPI Metrics Cards */}
        <KpiMetrics stats={stats} />

        {/* Section: High-Density Trade Execution Table */}
        <TradeTable trades={accountTrades} onDeleteTrade={handleDeleteTrade} />
      </main>

      {/* Manual Trade Entry Modal */}
      <NewTradeModal
        isOpen={isModalOpen}
        accountId={selectedAccountId}
        onClose={() => setIsModalOpen(false)}
        onSaveTrade={handleSaveTrade}
      />
    </div>
  );
}
