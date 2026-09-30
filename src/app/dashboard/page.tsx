'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '../../components/dashboard/Header';
import { Sidebar, DashboardTab } from '../../components/dashboard/Sidebar';
import { ProfileView } from '../../components/dashboard/ProfileView';
import { SettingsView } from '../../components/dashboard/SettingsView';
import { AccountsView } from '../../components/dashboard/AccountsView';
import { AccountOverview } from '../../components/dashboard/AccountOverview';
import { TradeTable } from '../../components/dashboard/TradeTable';
import { CalendarHeatmap } from '../../components/dashboard/CalendarHeatmap';
import { TradingPerformanceSummary } from '../../components/dashboard/TradingPerformanceSummary';
import { NewsCalendarView } from '../../components/dashboard/NewsCalendarView';
import { PsychologyAnalytics } from '../../components/dashboard/PsychologyAnalytics';
import { NewTradeModal } from '../../components/dashboard/NewTradeModal';
import { SyncModal } from '../../components/dashboard/SyncModal';
import { ImportStatementModal } from '../../components/dashboard/ImportStatementModal';
import { INITIAL_ACCOUNTS, INITIAL_TRADES } from '../../lib/sample-data';
import { calculateAccountStats } from '../../lib/forex-math';
import { getTradeDateStr } from '../../lib/analytics-math';
import { Trade, TradingAccount } from '../../types/trade';
import { Wallet } from 'lucide-react';
import {
  fetchAccountsFromSupabase,
  fetchTradesFromSupabase,
  saveAccountToSupabase,
  deleteAccountFromSupabase,
  saveTradeToSupabase,
  saveTradesBatchToSupabase,
  deleteTradeFromSupabase,
  updateAccountBalanceInSupabase,
} from '../../lib/supabase';

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>(INITIAL_ACCOUNTS);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [trades, setTrades] = useState<Trade[]>(INITIAL_TRADES);
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
  const [calendarAccountId, setCalendarAccountId] = useState<string>('ALL');
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [initialTradeNotes, setInitialTradeNotes] = useState<string>('');
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // Restore accounts and trades from localStorage first, then sync with Supabase
  useEffect(() => {
    setHasMounted(true);
    let isSubscribed = true;

    // 1. Initial immediate restore from localStorage
    try {
      const savedAccounts = localStorage.getItem('apex_accounts');
      if (savedAccounts) {
        const parsed = JSON.parse(savedAccounts);
        if (Array.isArray(parsed)) {
          const validAccounts = parsed.filter(
            (a) =>
              a &&
              a.id !== 'acc-main' &&
              a.name !== 'Primary Account' &&
              a.name !== 'Primary Trading Account' &&
              !a.name?.toLowerCase().includes('fundingpips') &&
              !a.broker?.toLowerCase().includes('fundingpips')
          );
          setAccounts(validAccounts);
          if (validAccounts.length > 0) {
            setSelectedAccountId(validAccounts[0].id);
          } else {
            setSelectedAccountId('');
          }
        }
      }
      const savedTrades = localStorage.getItem('apex_trades');
      if (savedTrades) {
        const parsed = JSON.parse(savedTrades);
        if (Array.isArray(parsed)) {
          const validTrades = parsed.filter((t) => t && t.accountId !== 'acc-main');
          setTrades(validTrades);
        }
      }
    } catch (err) {
      console.error('Failed to restore journal state from localStorage', err);
    }

    // 2. Fetch from Supabase and sync
    async function syncWithSupabase() {
      try {
        const [dbAccounts, dbTrades] = await Promise.all([
          fetchAccountsFromSupabase(),
          fetchTradesFromSupabase(),
        ]);

        if (!isSubscribed) return;

        if (dbAccounts.length > 0 || dbTrades.length > 0) {
          if (dbAccounts.length > 0) {
            setAccounts(dbAccounts);
            setSelectedAccountId((prev) =>
              prev && dbAccounts.some((a) => a.id === prev) ? prev : dbAccounts[0].id
            );
          }
          if (dbTrades.length > 0) {
            setTrades(dbTrades);
          }
        } else {
          // If Supabase is empty, check if we have local accounts/trades to migrate to Supabase
          const localAccsRaw = localStorage.getItem('apex_accounts');
          const localTradesRaw = localStorage.getItem('apex_trades');
          const localAccs: TradingAccount[] = localAccsRaw ? JSON.parse(localAccsRaw) : [];
          const localTrades: Trade[] = localTradesRaw ? JSON.parse(localTradesRaw) : [];

          const validAccs = localAccs.filter(
            (a) =>
              a &&
              a.id !== 'acc-main' &&
              a.name !== 'Primary Account' &&
              a.name !== 'Primary Trading Account' &&
              !a.name?.toLowerCase().includes('fundingpips') &&
              !a.broker?.toLowerCase().includes('fundingpips')
          );
          const validTrades = localTrades.filter((t) => t && t.accountId !== 'acc-main');

          if (validAccs.length > 0) {
            for (const acc of validAccs) {
              await saveAccountToSupabase(acc);
            }
          }
          if (validTrades.length > 0) {
            await saveTradesBatchToSupabase(validTrades);
          }
        }
      } catch (err) {
        console.error('Failed to sync with Supabase:', err);
      }
    }

    syncWithSupabase();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Sync accounts to localStorage cache
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem('apex_accounts', JSON.stringify(accounts));
    } catch (err) {
      console.error('Failed to sync accounts to localStorage', err);
    }
  }, [accounts, hasMounted]);

  // Sync trades to localStorage cache
  useEffect(() => {
    if (!hasMounted) return;
    try {
      localStorage.setItem('apex_trades', JSON.stringify(trades));
    } catch (err) {
      console.error('Failed to sync trades to localStorage', err);
    }
  }, [trades, hasMounted]);

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
    return accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;
  }, [accounts, selectedAccountId]);

  // Specific account stats
  const stats = useMemo(() => {
    return calculateAccountStats(accountTrades, selectedAccount?.initialBalance || 0);
  }, [accountTrades, selectedAccount]);

  // Aggregate Portfolio Stats (Summation across ALL accounts in the journal)
  const portfolioInitialBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + (curr.initialBalance || 0), 0);
  }, [accounts]);

  const portfolioStats = useMemo(() => {
    return calculateAccountStats(trades, portfolioInitialBalance);
  }, [trades, portfolioInitialBalance]);

  // Trades for P&L Calendar tab (allows filtering by specific account or all accounts)
  const calendarTrades = useMemo(() => {
    if (!calendarAccountId || calendarAccountId === 'ALL') return trades;
    return trades.filter((t) => t.accountId === calendarAccountId);
  }, [trades, calendarAccountId]);

  const displayedCalendarTrades = useMemo(() => {
    if (!selectedDateStr) return calendarTrades;
    return calendarTrades.filter((t) => getTradeDateStr(t) === selectedDateStr || t.closeTime.startsWith(selectedDateStr));
  }, [calendarTrades, selectedDateStr]);

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    if (trade.accountId) {
      setSelectedAccountId(trade.accountId);
    }
    setIsModalOpen(true);
  };

  const handleSaveTrade = async (savedTrade: Trade) => {
    const isExisting = trades.some((t) => t.id === savedTrade.id);
    const oldTrade = isExisting ? trades.find((t) => t.id === savedTrade.id) : null;
    const pnlDelta = isExisting && oldTrade ? savedTrade.netPnl - oldTrade.netPnl : savedTrade.netPnl;

    if (isExisting) {
      setTrades((prev) => prev.map((t) => (t.id === savedTrade.id ? savedTrade : t)));
    } else {
      setTrades((prev) => [savedTrade, ...prev]);
    }

    let updatedBalance: number | undefined;
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === savedTrade.accountId) {
          updatedBalance = Number((acc.currentBalance + pnlDelta).toFixed(2));
          return {
            ...acc,
            currentBalance: updatedBalance,
          };
        }
        return acc;
      })
    );

    // Persist to Supabase
    try {
      const currentAcc = accounts.find((a) => a.id === savedTrade.accountId);
      if (currentAcc) {
        await saveAccountToSupabase(currentAcc);
        if (updatedBalance !== undefined) {
          await updateAccountBalanceInSupabase(savedTrade.accountId, updatedBalance);
        }
      }
      await saveTradeToSupabase(savedTrade);
    } catch (err) {
      console.error('Error saving trade to Supabase:', err);
    }
  };

  const handleImportTrades = async (importedTrades: Trade[]) => {
    setTrades((prev) => [...importedTrades, ...prev]);

    const totalImportedPnl = importedTrades.reduce((sum, t) => sum + t.netPnl, 0);
    let updatedBalance: number | undefined;

    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedAccountId) {
          updatedBalance = Number((acc.currentBalance + totalImportedPnl).toFixed(2));
          return {
            ...acc,
            currentBalance: updatedBalance,
          };
        }
        return acc;
      })
    );

    // Persist to Supabase
    try {
      const currentAcc = accounts.find((a) => a.id === selectedAccountId);
      if (currentAcc) {
        await saveAccountToSupabase(currentAcc);
        if (updatedBalance !== undefined) {
          await updateAccountBalanceInSupabase(selectedAccountId, updatedBalance);
        }
      }
      await saveTradesBatchToSupabase(importedTrades);
    } catch (err) {
      console.error('Error batch importing trades to Supabase:', err);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    const tradeToDelete = trades.find((t) => t.id === id);
    if (!tradeToDelete) return;

    setTrades((prev) => prev.filter((t) => t.id !== id));

    let updatedBalance: number | undefined;
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === tradeToDelete.accountId) {
          updatedBalance = Number((acc.currentBalance - tradeToDelete.netPnl).toFixed(2));
          return {
            ...acc,
            currentBalance: updatedBalance,
          };
        }
        return acc;
      })
    );

    // Persist deletion to Supabase
    try {
      await deleteTradeFromSupabase(id);
      if (tradeToDelete.accountId && updatedBalance !== undefined) {
        await updateAccountBalanceInSupabase(tradeToDelete.accountId, updatedBalance);
      }
    } catch (err) {
      console.error('Error deleting trade from Supabase:', err);
    }
  };

  const handleAddAccount = async (newAccount: TradingAccount) => {
    setAccounts((prev) => [...prev, newAccount]);
    setSelectedAccountId(newAccount.id);
    setActiveTab('OVERVIEW');

    try {
      await saveAccountToSupabase(newAccount);
    } catch (err) {
      console.error('Error saving account to Supabase:', err);
    }
  };

  const handleUpdateAccount = async (updatedAccount: TradingAccount) => {
    setAccounts((prev) =>
      prev.map((acc) => (acc.id === updatedAccount.id ? updatedAccount : acc))
    );

    try {
      await saveAccountToSupabase(updatedAccount);
    } catch (err) {
      console.error('Error updating account in Supabase:', err);
    }
  };

  const handleDeleteAccount = async (accountIdToDelete: string) => {
    setAccounts((prev) => {
      const remaining = prev.filter((acc) => acc.id !== accountIdToDelete);
      if (selectedAccountId === accountIdToDelete) {
        setSelectedAccountId(remaining.length > 0 ? remaining[0].id : '');
      }
      return remaining;
    });
    setTrades((prev) => prev.filter((t) => t.accountId !== accountIdToDelete));

    try {
      await deleteAccountFromSupabase(accountIdToDelete);
    } catch (err) {
      console.error('Error deleting account from Supabase:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-slate-100 flex selection:bg-blue-600/30 selection:text-blue-200">
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
        {/* Navigation Header with Integrated Tabs & Controls */}
        <Header
          onOpenMobileMenu={() => setIsMobileNavOpen(true)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebar={() => setIsSidebarCollapsed((prev) => !prev)}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          accountsCount={accounts.length}
          selectedDateStr={selectedDateStr}
          onClearDateFilter={() => setSelectedDateStr(null)}
          onOpenImportModal={() => setIsImportModalOpen(true)}
        />

        {/* Main Dashboard Workspace */}
        <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-6 space-y-7">

          {/* View 1: Performance & Accounts Overview (Portfolio Summation across all accounts) */}
          {activeTab === 'OVERVIEW' && (
            <AccountOverview
              account={selectedAccount}
              accounts={accounts}
              onSelectAccount={setSelectedAccountId}
              stats={portfolioStats}
              trades={trades}
              onViewAllTrades={() => setActiveTab('LOG')}
              onOpenNewTrade={() => setIsModalOpen(true)}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onSelectDate={setSelectedDateStr}
              selectedDateStr={selectedDateStr}
              onNavigateToAccounts={() => setActiveTab('ACCOUNTS')}
            />
          )}

          {/* View: Dedicated Accounts Management View */}
          {activeTab === 'ACCOUNTS' && (
            <AccountsView
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={(id) => {
                setSelectedAccountId(id);
              }}
              onNavigateToOverview={(id) => {
                if (id) setSelectedAccountId(id);
                setActiveTab('OVERVIEW');
              }}
              onAddAccount={handleAddAccount}
              onUpdateAccount={handleUpdateAccount}
              onDeleteAccount={handleDeleteAccount}
              trades={trades}
              onOpenSyncModal={() => setIsSyncModalOpen(true)}
              onOpenImportModal={() => setIsImportModalOpen(true)}
              onDeleteTrade={handleDeleteTrade}
              onEditTrade={handleEditTrade}
              onOpenNewTrade={(accountId) => {
                if (accountId) setSelectedAccountId(accountId);
                setIsModalOpen(true);
              }}
            />
          )}

          {/* View 2: Execution Log Table */}
          {activeTab === 'LOG' && (
            <TradeTable
              trades={displayedTrades}
              onDeleteTrade={handleDeleteTrade}
              onEditTrade={handleEditTrade}
              onOpenNewTrade={() => setIsModalOpen(true)}
            />
          )}

          {/* View 3: P&L Calendar Heatmap + Filtered Table below */}
          {activeTab === 'CALENDAR' && (
            <div className="space-y-6">
              {/* Account Selector for P&L Calendar */}
              <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-4 h-4" strokeWidth={1.5} />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block font-heading">
                      Account P&L Calendar
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Inspect performance for a specific trading account or view consolidated across all accounts
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Account:</span>
                  <select
                    value={calendarAccountId}
                    onChange={(e) => setCalendarAccountId(e.target.value)}
                    className="bg-[#18181E] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer transition-colors"
                  >
                    <option value="ALL">All Accounts (Consolidated)</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.broker} - #{acc.accountNumber})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CalendarHeatmap
                trades={calendarTrades}
                onSelectDay={setSelectedDateStr}
                selectedDateStr={selectedDateStr}
              />

              <TradingPerformanceSummary trades={calendarTrades} />

              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  {selectedDateStr ? `Trades for ${selectedDateStr}` : 'Account Executions'}
                </h3>
                <TradeTable
                  trades={displayedCalendarTrades}
                  onDeleteTrade={handleDeleteTrade}
                  onOpenNewTrade={() => setIsModalOpen(true)}
                />
              </div>
            </div>
          )}

          {/* View: Forex Factory Economic News Calendar */}
          {activeTab === 'NEWS' && (
            <NewsCalendarView
              onOpenNewTradeWithContext={(contextNotes) => {
                setInitialTradeNotes(contextNotes);
                setIsModalOpen(true);
              }}
            />
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
                setTrades([]);
                setAccounts([]);
                setSelectedAccountId('');
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('apex_trades');
                  localStorage.removeItem('apex_accounts');
                }
              }}
              onClearAllTrades={() => {
                setTrades([]);
                setAccounts((prev) => prev.map((a) => ({ ...a, currentBalance: a.initialBalance })));
                if (typeof window !== 'undefined') {
                  localStorage.setItem('apex_trades', JSON.stringify([]));
                }
              }}
            />
          )}
        </main>
      </div>

      {/* Manual Trade Entry Modal */}
      <NewTradeModal
        isOpen={isModalOpen}
        accountId={selectedAccountId}
        onClose={() => {
          setIsModalOpen(false);
          setInitialTradeNotes('');
        }}
        onSaveTrade={handleSaveTrade}
        initialNotes={initialTradeNotes}
      />

      {/* MetaTrader Real-Time Sync Modal */}
      <SyncModal
        isOpen={isSyncModalOpen}
        accountId={selectedAccountId}
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
