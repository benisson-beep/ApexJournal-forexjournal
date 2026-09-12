'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../../components/dashboard/Header';
import { KpiMetrics } from '../../components/dashboard/KpiMetrics';
import { TradeTable } from '../../components/dashboard/TradeTable';
import { CalendarHeatmap } from '../../components/dashboard/CalendarHeatmap';
import { PsychologyAnalytics } from '../../components/dashboard/PsychologyAnalytics';
import { NewTradeModal } from '../../components/dashboard/NewTradeModal';
import { SyncModal } from '../../components/dashboard/SyncModal';
import { ImportStatementModal } from '../../components/dashboard/ImportStatementModal';
import { INITIAL_ACCOUNTS, INITIAL_TRADES } from '../../lib/sample-data';
import { calculateAccountStats } from '../../lib/forex-math';
import { Trade, TradingAccount } from '../../types/trade';
import { Brain, Calendar, CalendarDays, ListFilter, Upload } from 'lucide-react';

type TabView = 'LOG' | 'CALENDAR' | 'PSYCHOLOGY';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [activeTab, setActiveTab] = useState<TabView>('LOG');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Filter trades for the selected account
  const accountTrades = useMemo(() => {
    return trades.filter((t) => t.accountId === selectedAccountId);
  }, [trades, selectedAccountId]);

  // Optionally filter by selected calendar date
  const displayedTrades = useMemo(() => {
    if (!selectedDateStr) return accountTrades;
    return accountTrades.filter((t) => t.closeTime.startsWith(selectedDateStr));
  }, [accountTrades, selectedDateStr]);

  const selectedAccount = useMemo(() => {
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  }, [accounts, selectedAccountId]);

  // Dynamic portfolio stats calculation
  const stats = useMemo(() => {
    return calculateAccountStats(accountTrades, selectedAccount.initialBalance);
  }, [accountTrades, selectedAccount]);

  const handleSaveTrade = (newTrade: Trade) => {
    setTrades((prev) => [newTrade, ...prev]);

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

  const handleImportTrades = (importedTrades: Trade[]) => {
    setTrades((prev) => [...importedTrades, ...prev]);

    const totalImportedPnl = importedTrades.reduce((sum, t) => sum + t.netPnl, 0);

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedAccountId) {
          return {
            ...acc,
            currentBalance: Number((acc.currentBalance + totalImportedPnl).toFixed(2)),
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
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
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
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#0e131f] hover:bg-[#131929] border border-[#1b2336] hover:border-emerald-500/40 text-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
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

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-[#1b2336] pb-2">
          <div className="flex items-center gap-1.5 bg-[#0e131f] border border-[#1b2336] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('LOG')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'LOG'
                  ? 'bg-emerald-500 text-[#080b11] shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Trade Execution Log</span>
            </button>

            <button
              onClick={() => setActiveTab('CALENDAR')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'CALENDAR'
                  ? 'bg-emerald-500 text-[#080b11] shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>P&L Calendar</span>
            </button>

            <button
              onClick={() => setActiveTab('PSYCHOLOGY')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'PSYCHOLOGY'
                  ? 'bg-emerald-500 text-[#080b11] shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-[#131929]'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Edge & Psychology</span>
            </button>
          </div>

          {selectedDateStr && (
            <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
              <span>Date Filter: <strong className="text-emerald-400">{selectedDateStr}</strong></span>
              <button
                onClick={() => setSelectedDateStr(null)}
                className="text-[11px] underline text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Execution Log Table */}
        {activeTab === 'LOG' && (
          <TradeTable trades={displayedTrades} onDeleteTrade={handleDeleteTrade} />
        )}

        {/* Tab 2: P&L Calendar Heatmap + Filtered Table below */}
        {activeTab === 'CALENDAR' && (
          <div className="space-y-6">
            <CalendarHeatmap
              trades={accountTrades}
              onSelectDay={setSelectedDateStr}
              selectedDateStr={selectedDateStr}
            />

            <div>
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                {selectedDateStr ? `Trades for ${selectedDateStr}` : 'All Account Trades'}
              </h3>
              <TradeTable trades={displayedTrades} onDeleteTrade={handleDeleteTrade} />
            </div>
          </div>
        )}

        {/* Tab 3: Psychology & Edge Analytics */}
        {activeTab === 'PSYCHOLOGY' && (
          <PsychologyAnalytics trades={accountTrades} />
        )}
      </main>

      {/* Manual Trade Entry Modal */}
      <NewTradeModal
        isOpen={isModalOpen}
        accountId={selectedAccountId}
        onClose={() => setIsModalOpen(false)}
        onSaveTrade={handleSaveTrade}
      />

      {/* MetaTrader Real-Time Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onTradeSynced={handleSaveTrade}
      />

      {/* Statement CSV / HTML Importer Modal */}
      <ImportStatementModal
        isOpen={isImportModalOpen}
        accountId={selectedAccountId}
        onClose={() => setIsImportModalOpen(false)}
        onImportTrades={handleImportTrades}
      />
    </div>
  );
}
