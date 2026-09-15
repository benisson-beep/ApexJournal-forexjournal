'use client';

import React, { useState, useMemo } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Sidebar, DashboardTab } from '../../components/dashboard/Sidebar';
import { ProfileView } from '../../components/dashboard/ProfileView';
import { SettingsView } from '../../components/dashboard/SettingsView';
import { AccountsView } from '../../components/dashboard/AccountsView';
import { AccountOverview } from '../../components/dashboard/AccountOverview';
import { TradeTable } from '../../components/dashboard/TradeTable';
import { CalendarHeatmap } from '../../components/dashboard/CalendarHeatmap';
import { PsychologyAnalytics } from '../../components/dashboard/PsychologyAnalytics';
import { NewTradeModal } from '../../components/dashboard/NewTradeModal';
import { SyncModal } from '../../components/dashboard/SyncModal';
import { ImportStatementModal } from '../../components/dashboard/ImportStatementModal';
import { INITIAL_ACCOUNTS, INITIAL_TRADES } from '../../lib/sample-data';
import { calculateAccountStats } from '../../lib/forex-math';
import { Trade, TradingAccount } from '../../types/trade';
import { Brain, Calendar, CalendarDays, LayoutDashboard, ListFilter, Upload, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>(INITIAL_ACCOUNTS[0].id);
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

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
    <div className="min-h-screen bg-black text-slate-100 flex selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Side Navigation Bar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onOpenNewTrade={() => setIsModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        tradeCount={accountTrades.length}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        onSelectAccount={setSelectedAccountId}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Minimal Navigation Header with ONLY Log Trade button */}
        <Header
          onOpenNewTrade={() => setIsModalOpen(true)}
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
        />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          {/* Workspace Tabs (shown when browsing primary analytical views) */}
          {(activeTab === 'OVERVIEW' || activeTab === 'LOG' || activeTab === 'CALENDAR' || activeTab === 'PSYCHOLOGY' || activeTab === 'ACCOUNTS') && (
            <>
              {/* Section: Subheader & Quick Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-white">
                    Institutional Performance & Accounts
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Active Account: <span className="text-slate-200 font-semibold">{selectedAccount.name}</span> · Real-time statistical edge monitoring
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center gap-1.5 bg-[#080c14] hover:bg-[#101624] border border-white/10 hover:border-emerald-500/40 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    <span>Import MT4/MT5 CSV</span>
                  </button>
                  <div className="flex items-center gap-1 bg-[#080c14] border border-white/10 text-xs font-mono text-slate-400 px-3 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>September 2026</span>
                  </div>
                </div>
              </div>

              {/* View Mode Navigation Tabs */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex flex-wrap items-center gap-1.5 bg-black border border-white/10 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveTab('OVERVIEW')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'OVERVIEW'
                        ? 'bg-[#00c97b] text-black shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Overview & Accounts</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('ACCOUNTS')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'ACCOUNTS'
                        ? 'bg-[#00c97b] text-black shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Accounts ({accounts.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('LOG')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'LOG'
                        ? 'bg-[#00c97b] text-black shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ListFilter className="w-3.5 h-3.5" />
                    <span>Trade Execution Log</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('CALENDAR')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'CALENDAR'
                        ? 'bg-[#00c97b] text-black shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>P&L Calendar</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('PSYCHOLOGY')}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'PSYCHOLOGY'
                        ? 'bg-[#00c97b] text-black shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
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
            </>
          )}

          {/* View 1: Performance & Accounts Overview */}
          {activeTab === 'OVERVIEW' && (
            <AccountOverview
              account={selectedAccount}
              accounts={accounts}
              onSelectAccount={setSelectedAccountId}
              stats={stats}
              trades={accountTrades}
              onViewAllTrades={() => setActiveTab('LOG')}
              onOpenNewTrade={() => setIsModalOpen(true)}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onSelectDate={setSelectedDateStr}
              selectedDateStr={selectedDateStr}
            />
          )}

          {/* View: Dedicated Accounts Management View */}
          {activeTab === 'ACCOUNTS' && (
            <AccountsView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              trades={trades}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
            />
          )}

          {/* View 2: Execution Log Table */}
          {activeTab === 'LOG' && (
            <TradeTable trades={displayedTrades} onDeleteTrade={handleDeleteTrade} />
          )}

          {/* View 3: P&L Calendar Heatmap + Filtered Table below */}
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

          {/* View 4: Psychology & Edge Analytics */}
          {activeTab === 'PSYCHOLOGY' && (
            <PsychologyAnalytics trades={accountTrades} />
          )}

          {/* View 5: Trader Profile & Playbook */}
          {activeTab === 'PROFILE' && (
            <ProfileView
              account={selectedAccount}
              trades={accountTrades}
              stats={stats}
            />
          )}

          {/* View 6: Platform & Risk Settings */}
          {activeTab === 'SETTINGS' && (
            <SettingsView
              trades={trades}
              onResetSampleData={() => {
                setTrades(INITIAL_TRADES);
                setAccounts(INITIAL_ACCOUNTS);
              }}
              onClearAllTrades={() => setTrades([])}
            />
          )}
        </main>
      </div>

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
