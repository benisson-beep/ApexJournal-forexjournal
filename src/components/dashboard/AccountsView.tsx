'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { TradingAccount, Trade, AccountCategory, AccountStatus } from '../../types/trade';
import { EquityCurve } from './EquityCurve';
import { CalendarHeatmap } from './CalendarHeatmap';
import { TradeTable } from './TradeTable';
import { calculateAccountStats } from '../../lib/forex-math';
import { getTradeDateStr } from '../../lib/analytics-math';
import {
  Zap,
  Upload,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  GraduationCap,
  Sparkles,
  Crown,
  ShieldCheck,
  Wallet,
  MoreVertical,
  List,
  LayoutGrid,
  ChevronDown,
  CheckCircle2,
  BarChart3,
  LineChart,
  Calendar as CalendarIcon,
  ListOrdered,
} from 'lucide-react';

interface AccountsViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onNavigateToOverview?: (id?: string) => void;
  trades: Trade[];
  onOpenSyncModal: () => void;
  onOpenImportModal: () => void;
  onAddAccount?: (account: TradingAccount) => void;
  onUpdateAccount?: (account: TradingAccount) => void;
  onDeleteAccount?: (id: string) => void;
  onDeleteTrade?: (id: string) => void;
  onOpenNewTrade?: (accountId?: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onNavigateToOverview,
  trades,
  onOpenSyncModal,
  onOpenImportModal,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
  onDeleteTrade,
  onOpenNewTrade,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [phaseFilter, setPhaseFilter] = useState<string>('ALL');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const [traderName, setTraderName] = useState('benisson');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('apex_profile_name');
      if (saved && saved.trim()) {
        setTraderName(saved.trim());
      }
    }
  }, []);

  // Modal State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formBroker, setFormBroker] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formCategory, setFormCategory] = useState<AccountCategory>('PROP_CHALLENGE');
  const [formPhase, setFormPhase] = useState('Phase 1');
  const [formStatus, setFormStatus] = useState<AccountStatus>('ACTIVE');
  const [formPlatform, setFormPlatform] = useState('MT5');
  const [formEnvironment, setFormEnvironment] = useState('Live');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formInitialBalance, setFormInitialBalance] = useState('50000');
  const [formAccountSize, setFormAccountSize] = useState('50000');

  const openAddModal = () => {
    setEditingAccount(null);
    setFormName('');
    setFormBroker('');
    setFormAccountNumber('');
    setFormCategory('PROP_CHALLENGE');
    setFormPhase('Phase 1');
    setFormStatus('ACTIVE');
    setFormPlatform('MT5');
    setFormEnvironment('Live');
    setFormCurrency('USD');
    setFormInitialBalance('50000');
    setFormAccountSize('50000');
    setIsAccountModalOpen(true);
  };

  const openEditModal = (acc: TradingAccount) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormBroker(acc.broker);
    setFormAccountNumber(acc.accountNumber);
    setFormCategory(acc.accountType || 'PROP_CHALLENGE');
    setFormPhase(acc.phase || 'Phase 1');
    setFormStatus(acc.status || 'ACTIVE');
    setFormPlatform(acc.platform || 'MT5');
    setFormEnvironment(acc.environment || acc.server || 'Live');
    setFormCurrency(acc.currency || 'USD');
    setFormInitialBalance(acc.initialBalance.toString());
    setFormAccountSize((acc.accountSize ?? acc.initialBalance).toString());
    setIsAccountModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initBal = parseFloat(String(formInitialBalance).replace(/[^0-9.]/g, '')) || 50000;
    const accSize = parseFloat(String(formAccountSize).replace(/[^0-9.]/g, '')) || initBal;

    if (editingAccount) {
      const pnl = editingAccount.currentBalance - editingAccount.initialBalance;
      const updated: TradingAccount = {
        ...editingAccount,
        name: formName.trim() || 'Main Trading Account',
        broker: formBroker.trim() || 'FundingPips',
        accountNumber: formAccountNumber.trim() || '—',
        accountType: formCategory,
        phase: formPhase,
        status: formStatus,
        platform: formPlatform,
        environment: formEnvironment,
        server: formEnvironment,
        currency: formCurrency,
        initialBalance: initBal,
        accountSize: accSize,
        currentBalance: Number((initBal + pnl).toFixed(2)),
        isLive: formEnvironment === 'Live' || formCategory === 'LIVE_BROKER' || formCategory === 'PROP_FUNDED',
      };
      onUpdateAccount?.(updated);
      if (inspectingAccount?.id === updated.id) {
        setInspectingAccount(updated);
      }
    } else {
      const newAcc: TradingAccount = {
        id: `acc-${Date.now()}`,
        name: formName.trim() || 'Main Trading Account',
        broker: formBroker.trim() || 'FundingPips',
        accountNumber: formAccountNumber.trim() || String(Math.floor(10000000 + Math.random() * 9000000)),
        accountType: formCategory,
        phase: formPhase,
        status: formStatus,
        platform: formPlatform,
        environment: formEnvironment,
        server: formEnvironment,
        currency: formCurrency,
        initialBalance: initBal,
        accountSize: accSize,
        currentBalance: initBal,
        isLive: formEnvironment === 'Live' || formCategory === 'LIVE_BROKER' || formCategory === 'PROP_FUNDED',
        syncEnabled: false,
      };
      onAddAccount?.(newAcc);
      onSelectAccount(newAcc.id);
      setInspectingAccount(newAcc);
      setInspectTab('ALL');
    }
    setIsAccountModalOpen(false);
  };

  // Dedicated Full-Screen Account Details View State
  const [inspectingAccount, setInspectingAccount] = useState<TradingAccount | null>(null);
  const [inspectTab, setInspectTab] = useState<'ALL' | 'EQUITY' | 'CALENDAR' | 'TRADES'>('ALL');
  const [inspectDateStr, setInspectDateStr] = useState<string | null>(null);

  const currentInspectingAccount = useMemo(() => {
    if (!inspectingAccount) return null;
    return accounts.find((a) => a.id === inspectingAccount.id) || inspectingAccount;
  }, [accounts, inspectingAccount]);

  const inspectingTrades = useMemo(() => {
    if (!currentInspectingAccount) return [];
    return trades.filter((t) => t.accountId === currentInspectingAccount.id);
  }, [trades, currentInspectingAccount]);

  const inspectingStats = useMemo(() => {
    if (!currentInspectingAccount) return null;
    return calculateAccountStats(inspectingTrades, currentInspectingAccount.initialBalance || 0);
  }, [inspectingTrades, currentInspectingAccount]);

  const displayedInspectTrades = useMemo(() => {
    if (!inspectDateStr) return inspectingTrades;
    return inspectingTrades.filter((t) => getTradeDateStr(t) === inspectDateStr || t.closeTime.startsWith(inspectDateStr));
  }, [inspectingTrades, inspectDateStr]);

  const handleInspectAccount = (acc: TradingAccount) => {
    setInspectingAccount(acc);
    setInspectTab('ALL');
    setInspectDateStr(null);
    setActiveMenuId(null);
  };

  const handleAccountClick = (id: string) => {
    const acc = accounts.find((a) => a.id === id);
    if (acc) {
      onSelectAccount(id);
      handleInspectAccount(acc);
    }
  };



  const renderSparkline = (acc: TradingAccount, accountTrades: Trade[]) => {
    let points: number[] = [];
    if (accountTrades.length >= 1) {
      const sortedTrades = [...accountTrades].sort(
        (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
      );
      let running = acc.initialBalance;
      points.push(running);
      sortedTrades.forEach((t) => {
        running += t.netPnl;
        points.push(running);
      });
    } else {
      points = [acc.initialBalance, acc.initialBalance];
    }

    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || (min > 0 ? min * 0.1 : 1);
    const width = 140;
    const height = 28;
    const padding = 3;

    const pathD = points
      .map((val, idx) => {
        const x = (idx / (points.length - 1 || 1)) * width;
        const y =
          max === min
            ? height / 2
            : height - padding - ((val - min) / range) * (height - padding * 2);
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

  // Filter accounts
  const filteredAccounts = accounts.filter((acc) => {
    if (typeFilter !== 'ALL' && acc.accountType !== typeFilter) return false;
    if (stateFilter !== 'ALL' && (acc.status || 'ACTIVE') !== stateFilter) return false;
    if (phaseFilter !== 'ALL' && acc.phase !== phaseFilter) return false;
    return true;
  });

  const getAccountIcon = (acc: TradingAccount) => {
    if (acc.phase === 'Phase 2') {
      return (
        <div className="w-10 h-10 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4" strokeWidth={1.5} />
        </div>
      );
    }
    if (acc.phase === 'Phase 1' || acc.accountType === 'PROP_CHALLENGE') {
      return (
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4" strokeWidth={1.5} />
        </div>
      );
    }
    if (acc.phase === 'Master / Funded' || acc.phase === 'Master' || acc.accountType === 'PROP_FUNDED') {
      return (
        <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
          <Crown className="w-4 h-4" strokeWidth={1.5} />
        </div>
      );
    }
    if (acc.accountType === 'LIVE_BROKER') {
      return (
        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" strokeWidth={1.5} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-400 flex items-center justify-center shrink-0">
        <Wallet className="w-4 h-4" strokeWidth={1.5} />
      </div>
    );
  };

  const getStatusBadge = (acc: TradingAccount, pnlPct: number) => {
    const status = acc.status || (pnlPct >= 10 ? 'PASSED' : pnlPct <= -10 ? 'BREACHED' : 'ACTIVE');

    if (status === 'PASSED') {
      return (
        <span className="px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
          Passed
        </span>
      );
    }
    if (status === 'BREACHED') {
      return (
        <span className="px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/25">
          Not Passed
        </span>
      );
    }
    if (status === 'ARCHIVED') {
      return (
        <span className="px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-500/10 text-slate-400 border border-slate-500/25">
          Archived
        </span>
      );
    }
    if (acc.phase === 'Master / Funded' || acc.phase === 'Master' || acc.accountType === 'PROP_FUNDED') {
      return (
        <span className="px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/25">
          Funded
        </span>
      );
    }
    return (
      <span className="px-3 py-0.5 rounded-full text-xs font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/25">
        Active
      </span>
    );
  };

  const renderAccountModal = () => {
    if (!isAccountModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-[#18181E] border border-white/[0.08] rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
          <div className="p-4 px-5 border-b border-white/[0.06] flex items-center justify-between bg-[#131317]">
            <h3 className="font-semibold text-white text-sm tracking-tight font-heading">
              {editingAccount ? 'Edit Account Configuration' : 'Add Trading Account'}
            </h3>
            <button
              type="button"
              onClick={() => setIsAccountModalOpen(false)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
            {/* ACCOUNT NAME */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                Account Name
              </label>
              <input
                type="text"
                required
                placeholder="Main Trading Account"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* BROKER / PROP FIRM & ACCOUNT ID */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Broker / Prop Firm
                </label>
                <input
                  type="text"
                  required
                  placeholder="FundingPips"
                  value={formBroker}
                  onChange={(e) => setFormBroker(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Account ID
                </label>
                <input
                  type="text"
                  placeholder="12345678"
                  value={formAccountNumber}
                  onChange={(e) => setFormAccountNumber(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* ACCOUNT CATEGORY & PHASE / STAGE */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Account Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as AccountCategory)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="PROP_CHALLENGE">Prop Evaluation</option>
                  <option value="PROP_FUNDED">Prop Funded</option>
                  <option value="LIVE_BROKER">Live Broker</option>
                  <option value="DEMO">Demo / Paper</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Phase / Stage
                </label>
                <select
                  value={formPhase}
                  onChange={(e) => setFormPhase(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Phase 1">Phase 1</option>
                  <option value="Phase 2">Phase 2</option>
                  <option value="Phase 3">Phase 3</option>
                  <option value="Master / Funded">Master / Funded</option>
                  <option value="Live">Live</option>
                  <option value="Demo">Demo</option>
                </select>
              </div>
            </div>

            {/* ACCOUNT STATUS & PLATFORM */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Account Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as AccountStatus)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PASSED">Passed</option>
                  <option value="BREACHED">Breached</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Platform
                </label>
                <select
                  value={formPlatform}
                  onChange={(e) => setFormPlatform(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="MT5">MT5</option>
                  <option value="MT4">MT4</option>
                  <option value="cTrader">cTrader</option>
                  <option value="TradingView">TradingView</option>
                  <option value="DXtrade">DXtrade</option>
                  <option value="Match-Trader">Match-Trader</option>
                </select>
              </div>
            </div>

            {/* ENVIRONMENT & CURRENCY */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Environment
                </label>
                <select
                  value={formEnvironment}
                  onChange={(e) => setFormEnvironment(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
                >
                  <option value="Live">Live</option>
                  <option value="Demo">Demo</option>
                  <option value="Simulated">Simulated</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                  Currency
                </label>
                <select
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors font-mono"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="CHF">CHF (Fr)</option>
                  <option value="NZD">NZD ($)</option>
                </select>
              </div>
            </div>

            {/* STARTING BALANCE */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                Starting Balance
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="50,000"
                  value={formInitialBalance}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormInitialBalance(val);
                    if (!formAccountSize || formAccountSize === formInitialBalance) {
                      setFormAccountSize(val);
                    }
                  }}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* ACCOUNT SIZE */}
            <div>
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 font-heading">
                Account Size
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="50,000"
                  value={formAccountSize}
                  onChange={(e) => setFormAccountSize(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] focus:border-blue-500/50 rounded-lg pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors font-mono"
                />
              </div>
            </div>

            {/* ACTIONS FOOTER */}
            <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAccountModalOpen(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={2} />
                <span>{editingAccount ? 'Save Changes' : 'Create Account'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Full-Screen Dedicated Account Analysis View
  if (currentInspectingAccount && inspectingStats) {
    const accountPnl = currentInspectingAccount.currentBalance - currentInspectingAccount.initialBalance;
    const pnlPct = currentInspectingAccount.initialBalance > 0
      ? (accountPnl / currentInspectingAccount.initialBalance) * 100
      : 0;

    return (
      <div className="space-y-6 animate-in fade-in duration-150">
        {/* Top Header & Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/[0.08]">
          <div className="flex items-start sm:items-center gap-3.5">
            <button
              onClick={() => {
                setInspectingAccount(null);
                setInspectDateStr(null);
              }}
              className="flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-[#18181E] hover:bg-[#202028] border border-white/[0.08] hover:border-white/[0.15] px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm group shrink-0"
              title="Return to All Accounts"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform text-slate-400 group-hover:text-white" />
              <span>All Accounts</span>
            </button>

            <div className="hidden sm:block h-6 w-[1px] bg-white/[0.08]" />

            <div className="flex items-center gap-3 min-w-0">
              {getAccountIcon(currentInspectingAccount)}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold text-white font-heading tracking-tight truncate">
                    {currentInspectingAccount.name}
                  </h1>
                  <span className="text-xs text-slate-400 font-mono">
                    #{currentInspectingAccount.accountNumber}
                  </span>
                  <span className="text-[10px] text-slate-300 bg-white/[0.06] border border-white/[0.08] px-2 py-0.5 rounded font-mono">
                    {currentInspectingAccount.broker}
                  </span>
                  <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded font-medium">
                    {currentInspectingAccount.phase || currentInspectingAccount.accountType}
                  </span>
                  {getStatusBadge(currentInspectingAccount, pnlPct)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-mono truncate">
                  {currentInspectingAccount.platform} · {currentInspectingAccount.environment || 'Live'} · {currentInspectingAccount.currency} · {inspectingTrades.length} Trades Executed
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {onOpenNewTrade && (
              <button
                onClick={() => onOpenNewTrade(currentInspectingAccount.id)}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Log Trade</span>
              </button>
            )}

            {currentInspectingAccount.id === selectedAccountId ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Active Account</span>
              </span>
            ) : (
              <button
                onClick={() => onSelectAccount(currentInspectingAccount.id)}
                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-white bg-blue-500/10 hover:bg-blue-600 border border-blue-500/25 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Set as Active</span>
              </button>
            )}

            <button
              onClick={() => openEditModal(currentInspectingAccount)}
              className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#18181E] hover:bg-[#202028] border border-white/[0.08] hover:border-white/[0.15] px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer"
              title="Edit Account Configuration"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            <button
              onClick={onOpenSyncModal}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-[#18181E] hover:bg-[#202028] border border-white/[0.08] px-3 py-2 rounded-xl transition-colors cursor-pointer"
              title="MT5 / Webhook Synchronization"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Sync</span>
            </button>

            {onDeleteAccount && (
              <button
                onClick={() => {
                  if (confirm(`Delete account "${currentInspectingAccount.name}"? This removes the account and its trades.`)) {
                    onDeleteAccount(currentInspectingAccount.id);
                    setInspectingAccount(null);
                  }
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-white/[0.06] hover:border-rose-500/20 transition-all cursor-pointer"
                title="Delete Account"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 5 KPI Stat Cards Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-heading">
              Current Balance
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-white mt-1 block">
              ${currentInspectingAccount.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Start: ${currentInspectingAccount.initialBalance.toLocaleString('en-US')}
            </span>
          </div>

          <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-heading">
              Net Realized P&L
            </span>
            <span
              className={`text-lg sm:text-xl font-bold font-mono mt-1 block ${
                inspectingStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {inspectingStats.netPnl >= 0 ? '+' : ''}${inspectingStats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-[11px] font-mono mt-0.5 block font-medium ${
                inspectingStats.netPnl >= 0 ? 'text-emerald-400/80' : 'text-rose-400/80'
              }`}
            >
              {currentInspectingAccount.initialBalance > 0
                ? `${inspectingStats.netPnl >= 0 ? '+' : ''}${((inspectingStats.netPnl / currentInspectingAccount.initialBalance) * 100).toFixed(2)}%`
                : '0.00%'}
            </span>
          </div>

          <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-heading">
              Win Rate
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-100 mt-1 block">
              {inspectingStats.winRate.toFixed(1)}%
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {inspectingStats.winningTrades}W / {inspectingStats.losingTrades}L
            </span>
          </div>

          <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-heading">
              Profit Factor
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-100 mt-1 block">
              {inspectingStats.profitFactor.toFixed(2)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Max DD: {inspectingStats.maxDrawdown.toFixed(1)}%
            </span>
          </div>

          <div className="bg-[#18181E] border border-white/[0.06] rounded-xl p-4 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block font-heading">
              Total Trades
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-200 mt-1 block">
              {inspectingTrades.length}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              Size: ${currentInspectingAccount.accountSize ? currentInspectingAccount.accountSize.toLocaleString('en-US') : currentInspectingAccount.initialBalance.toLocaleString('en-US')}
            </span>
          </div>
        </div>

        {/* View Mode Tabs Strip */}
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3 overflow-x-auto">
          <button
            onClick={() => setInspectTab('ALL')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              inspectTab === 'ALL'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Full Overview</span>
          </button>

          <button
            onClick={() => setInspectTab('EQUITY')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              inspectTab === 'EQUITY'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Equity Curve</span>
          </button>

          <button
            onClick={() => setInspectTab('CALENDAR')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              inspectTab === 'CALENDAR'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>P&L Calendar</span>
          </button>

          <button
            onClick={() => setInspectTab('TRADES')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              inspectTab === 'TRADES'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Trades ({inspectingTrades.length})</span>
          </button>
        </div>

        {/* View Mode Content */}
        {inspectTab === 'ALL' && (
          <div className="space-y-6">
            <EquityCurve
              account={currentInspectingAccount}
              trades={inspectingTrades}
              selectedDateStr={inspectDateStr}
            />

            <CalendarHeatmap
              trades={inspectingTrades}
              onSelectDay={setInspectDateStr}
              selectedDateStr={inspectDateStr}
            />

            {inspectDateStr && (
              <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                <span className="text-xs font-medium text-blue-300">
                  Showing trades for <span className="font-mono font-bold text-white">{inspectDateStr}</span> ({displayedInspectTrades.length} trades)
                </span>
                <button
                  onClick={() => setInspectDateStr(null)}
                  className="text-xs text-blue-400 hover:text-white underline cursor-pointer"
                >
                  Clear Date Filter
                </button>
              </div>
            )}

            <TradeTable
              trades={displayedInspectTrades}
              onDeleteTrade={onDeleteTrade || (() => {})}
              onOpenNewTrade={onOpenNewTrade ? () => onOpenNewTrade(currentInspectingAccount.id) : undefined}
            />
          </div>
        )}

        {inspectTab === 'EQUITY' && (
          <div className="space-y-4">
            <EquityCurve
              account={currentInspectingAccount}
              trades={inspectingTrades}
              selectedDateStr={inspectDateStr}
            />
          </div>
        )}

        {inspectTab === 'CALENDAR' && (
          <div className="space-y-4">
            <CalendarHeatmap
              trades={inspectingTrades}
              onSelectDay={setInspectDateStr}
              selectedDateStr={inspectDateStr}
            />

            {inspectDateStr && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <span className="text-xs font-medium text-blue-300">
                    Trades on <span className="font-mono font-bold text-white">{inspectDateStr}</span> ({displayedInspectTrades.length})
                  </span>
                  <button
                    onClick={() => setInspectDateStr(null)}
                    className="text-xs text-blue-400 hover:text-white underline cursor-pointer"
                  >
                    Clear Date Filter
                  </button>
                </div>
                <TradeTable
                  trades={displayedInspectTrades}
                  onDeleteTrade={onDeleteTrade || (() => {})}
                  onOpenNewTrade={onOpenNewTrade ? () => onOpenNewTrade(currentInspectingAccount.id) : undefined}
                />
              </div>
            )}
          </div>
        )}

        {inspectTab === 'TRADES' && (
          <div className="space-y-4">
            <TradeTable
              trades={inspectingTrades}
              onDeleteTrade={onDeleteTrade || (() => {})}
              onOpenNewTrade={onOpenNewTrade ? () => onOpenNewTrade(currentInspectingAccount.id) : undefined}
            />
          </div>
        )}

        {/* Edit/Add Account Modal */}
        {renderAccountModal()}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Top Greeting Card (Inspired by reference layout) */}
      <div className="relative bg-gradient-to-br from-[#16161C] via-[#131317] to-[#1a140f] border border-white/[0.08] rounded-2xl p-6 overflow-hidden">
        {/* Ambient warm radial glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-600/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
              Hey, {traderName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Your trading account and portfolio overview
            </p>
          </div>

          {/* Primary Action Button */}
          <button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider py-2.5 px-5 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-blue-900/20 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Trading Account</span>
          </button>
        </div>
      </div>

      {/* 2. Filter Bar & View Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-[#131317] border border-white/[0.08] hover:border-white/[0.14] text-xs font-medium text-slate-300 rounded-lg pl-3 pr-8 py-2 cursor-pointer outline-none transition-colors"
            >
              <option value="ALL">All Types</option>
              <option value="PROP_CHALLENGE">Prop Challenge</option>
              <option value="PROP_FUNDED">Funded / Master</option>
              <option value="LIVE_BROKER">Live Broker</option>
              <option value="DEMO">Demo</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* State Filter */}
          <div className="relative">
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="appearance-none bg-[#131317] border border-white/[0.08] hover:border-white/[0.14] text-xs font-medium text-slate-300 rounded-lg pl-3 pr-8 py-2 cursor-pointer outline-none transition-colors"
            >
              <option value="ALL">All States</option>
              <option value="ACTIVE">Active</option>
              <option value="PASSED">Passed</option>
              <option value="BREACHED">Not Passed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>

          {/* Phase Filter */}
          <div className="relative">
            <select
              value={phaseFilter}
              onChange={(e) => setPhaseFilter(e.target.value)}
              className="appearance-none bg-[#131317] border border-white/[0.08] hover:border-white/[0.14] text-xs font-medium text-slate-300 rounded-lg pl-3 pr-8 py-2 cursor-pointer outline-none transition-colors"
            >
              <option value="ALL">All Phases</option>
              <option value="Phase 1">Phase 1</option>
              <option value="Phase 2">Phase 2</option>
              <option value="Master / Funded">Master / Funded</option>
              <option value="Live">Live</option>
              <option value="Standard">Standard</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        {/* Right: Quick actions + View Switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#131317] hover:bg-[#18181E] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">Import CSV</span>
          </button>

          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 bg-[#131317] hover:bg-[#18181E] border border-white/[0.06] hover:border-white/[0.12] text-slate-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span className="hidden sm:inline">EA Sync</span>
          </button>

          {/* List vs Grid View Toggle */}
          <div className="flex items-center bg-[#131317] border border-white/[0.08] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Account Items Display */}
      {filteredAccounts.length === 0 ? (
        <div className="bg-[#131317] border border-dashed border-white/[0.1] rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-400 mx-auto">
            <Wallet className="w-6 h-6" strokeWidth={1.5} />
          </div>
          <h3 className="text-sm font-semibold text-white">
            {accounts.length === 0 ? 'No Trading Accounts Connected' : 'No Accounts Match Filters'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {accounts.length === 0
              ? 'Connect your prop firm challenge, funded account, or broker account to start journal execution tracking.'
              : 'Try clearing your filters to see registered accounts.'}
          </p>
          {accounts.length === 0 && (
            <div className="pt-2">
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" strokeWidth={2} />
                <span>Add Your First Account</span>
              </button>
            </div>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* List View (Inspired by reference screenshot) */
        <div className="space-y-2.5">
          {filteredAccounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            const accountPnl = acc.currentBalance - acc.initialBalance;
            const pnlPct = acc.initialBalance > 0 ? (accountPnl / acc.initialBalance) * 100 : 0;
            const accountTrades = trades.filter((t) => t.accountId === acc.id);
            const isMenuOpen = activeMenuId === acc.id;

            return (
              <div
                key={acc.id}
                onClick={() => handleAccountClick(acc.id)}
                className={`group bg-[#18181E] hover:bg-[#1e1e26] border rounded-xl p-3.5 sm:p-4 transition-all flex items-center justify-between gap-4 cursor-pointer relative ${
                  isSelected ? 'border-blue-500/50 bg-blue-600/[0.03]' : 'border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                {/* Left: Icon & Account Details */}
                <div className="flex items-center gap-3.5 min-w-0">
                  {getAccountIcon(acc)}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white font-mono text-sm tracking-tight">
                        #{acc.accountNumber || acc.id.slice(-6)}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {acc.phase || acc.name}
                      </span>
                      <span className="text-[10px] text-slate-400 bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.2 rounded font-mono">
                        {acc.broker}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded font-medium">
                          Active Workspace
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs font-mono">
                      <span className="font-semibold text-slate-200">
                        ${acc.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-slate-500">·</span>
                      <span
                        className={`font-semibold tabular-nums ${
                          pnlPct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                      </span>
                      <span className="text-slate-500 text-[11px] hidden sm:inline">
                        ({accountTrades.length} trades)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Dropdown Action */}
                <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {getStatusBadge(acc, pnlPct)}

                  <button
                    onClick={() => handleAccountClick(acc.id)}
                    className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-slate-300 hover:text-white bg-white/[0.04] hover:bg-blue-600 hover:border-blue-500 border border-white/[0.08] px-2.5 py-1 rounded-md transition-all cursor-pointer group/btn"
                    title="View Account Details & Equity Curve"
                  >
                    <span>Analyze</span>
                    <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover/btn:text-white transition-colors" />
                  </button>

                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuId(isMenuOpen ? null : acc.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
                      title="Account Options"
                    >
                      <MoreVertical className="w-4 h-4" strokeWidth={1.5} />
                    </button>

                    {/* Context Dropdown Menu */}
                    {isMenuOpen && (
                      <div className="absolute right-0 top-8 z-30 w-48 bg-[#131317] border border-white/[0.1] rounded-lg shadow-2xl py-1 text-xs font-medium animate-in fade-in zoom-in-95 duration-100">
                        <button
                          onClick={() => {
                            handleAccountClick(acc.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                          <span>View Analysis & Charts</span>
                        </button>
                        <button
                          onClick={() => openEditModal(acc)}
                          className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit Details</span>
                        </button>
                        <button
                          onClick={() => {
                            onOpenSyncModal();
                            setActiveMenuId(null);
                          }}
                          className="w-full text-left px-3 py-2 text-slate-200 hover:bg-white/[0.06] flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-slate-400" />
                          <span>Webhook Sync</span>
                        </button>
                        {onDeleteAccount && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete account "${acc.name}"? This removes the account and its trades.`)) {
                                onDeleteAccount(acc.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer border-t border-white/[0.06]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Account</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Grid Card View (Detailed with equity sparklines) */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAccounts.map((acc) => {
            const isSelected = acc.id === selectedAccountId;
            const accountPnl = acc.currentBalance - acc.initialBalance;
            const pnlPct = acc.initialBalance > 0 ? (accountPnl / acc.initialBalance) * 100 : 0;
            const accountTrades = trades.filter((t) => t.accountId === acc.id);

            return (
              <div
                key={acc.id}
                onClick={() => handleAccountClick(acc.id)}
                className={`group bg-[#18181E] hover:bg-[#1e1e26] border rounded-xl p-5 transition-all relative cursor-pointer ${
                  isSelected ? 'border-blue-500/50 bg-blue-600/[0.03]' : 'border-white/[0.08] hover:border-white/[0.14]'
                }`}
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {getAccountIcon(acc)}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-white tracking-tight">{acc.name}</h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded text-slate-400 bg-white/[0.04] border border-white/[0.06]">
                          {acc.broker}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        #{acc.accountNumber} · {acc.phase || 'Standard'} · {acc.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(acc, pnlPct)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(acc);
                      }}
                      className="p-1 hover:bg-white/[0.08] rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div className="grid grid-cols-2 gap-3 my-4 p-3 bg-[#131317] border border-white/[0.04] rounded-lg">
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
                      Net P&L / Return
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

                {/* Sparkline */}
                {renderSparkline(acc, accountTrades)}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3.5 mt-1 border-t border-white/[0.04]">
                  <span className="text-xs text-slate-400 font-mono">
                    {accountTrades.length} trades recorded
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAccountClick(acc.id);
                    }}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
                      isSelected
                        ? 'text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25'
                        : 'text-white bg-blue-600 hover:bg-blue-500 active:bg-blue-700'
                    }`}
                  >
                    <span>{isSelected ? 'View Analysis' : 'Analyze Account'}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Account Create / Edit Modal */}
      {renderAccountModal()}
    </div>
  );
};
