'use client';

import React, { useState } from 'react';
import { TradingAccount, Trade } from '../../types/trade';
import { Zap, Upload, ArrowUpRight, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface AccountsViewProps {
  accounts: TradingAccount[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  trades: Trade[];
  onOpenSyncModal: () => void;
  onOpenImportModal: () => void;
  onAddAccount?: (account: TradingAccount) => void;
  onUpdateAccount?: (account: TradingAccount) => void;
  onDeleteAccount?: (id: string) => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  trades,
  onOpenSyncModal,
  onOpenImportModal,
  onAddAccount,
  onUpdateAccount,
  onDeleteAccount,
}) => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<TradingAccount | null>(null);

  const [formName, setFormName] = useState('');
  const [formBroker, setFormBroker] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');
  const [formServer, setFormServer] = useState('');
  const [formCurrency, setFormCurrency] = useState('USD');
  const [formInitialBalance, setFormInitialBalance] = useState('10000');

  const openAddModal = () => {
    setEditingAccount(null);
    setFormName('Primary Account');
    setFormBroker('FTMO');
    setFormAccountNumber('');
    setFormServer('Demo');
    setFormCurrency('USD');
    setFormInitialBalance('10000');
    setIsAccountModalOpen(true);
  };

  const openEditModal = (acc: TradingAccount) => {
    setEditingAccount(acc);
    setFormName(acc.name);
    setFormBroker(acc.broker);
    setFormAccountNumber(acc.accountNumber);
    setFormServer(acc.server);
    setFormCurrency(acc.currency);
    setFormInitialBalance(acc.initialBalance.toString());
    setIsAccountModalOpen(true);
  };

  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initBal = parseFloat(formInitialBalance) || 10000;

    if (editingAccount) {
      const pnl = editingAccount.currentBalance - editingAccount.initialBalance;
      const updated: TradingAccount = {
        ...editingAccount,
        name: formName.trim() || 'Trading Account',
        broker: formBroker.trim() || 'Broker',
        accountNumber: formAccountNumber.trim() || '—',
        server: formServer.trim() || 'Live',
        currency: formCurrency,
        initialBalance: initBal,
        currentBalance: Number((initBal + pnl).toFixed(2)),
      };
      onUpdateAccount?.(updated);
    } else {
      const newAcc: TradingAccount = {
        id: `acc-${Date.now()}`,
        name: formName.trim() || 'Trading Account',
        broker: formBroker.trim() || 'Broker',
        accountNumber: formAccountNumber.trim() || '—',
        server: formServer.trim() || 'Live',
        currency: formCurrency,
        initialBalance: initBal,
        currentBalance: initBal,
        isLive: true,
        syncEnabled: false,
      };
      onAddAccount?.(newAcc);
    }
    setIsAccountModalOpen(false);
  };

  const totalBalance = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalInitial = accounts.reduce((sum, a) => sum + a.initialBalance, 0);
  const totalPnl = totalBalance - totalInitial;
  const totalReturnPct = totalInitial > 0 ? (totalPnl / totalInitial) * 100 : 0;

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
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Add Account</span>
          </button>
          <button
            onClick={onOpenImportModal}
            className="flex items-center gap-1.5 bg-[#131317] hover:bg-[#18181E] border border-white/[0.06] hover:border-white/[0.12] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
            <span>Import CSV</span>
          </button>
          <button
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 bg-[#18181E] hover:bg-[#202027] border border-white/[0.08] hover:border-white/[0.14] text-slate-200 font-medium text-xs px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
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
            {accounts.length} registered {accounts.length === 1 ? 'account' : 'accounts'}
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

      {/* Account Cards Below */}
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
              {/* Top Row: Account Name & Status Badge & Edit/Delete Actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white tracking-tight">{acc.name}</h3>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded text-slate-400 bg-white/[0.04] border border-white/[0.06]">
                      {acc.broker}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    #{acc.accountNumber} · Server: {acc.server} · {acc.currency}
                  </p>
                </div>

                <div className="flex items-center gap-2">
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

                  {onUpdateAccount && (
                    <button
                      onClick={() => openEditModal(acc)}
                      className="p-1 hover:bg-white/[0.08] rounded text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title="Edit Account"
                    >
                      <Edit2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}

                  {onDeleteAccount && accounts.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete account "${acc.name}"? This removes the account and its trades from the journal.`)) {
                          onDeleteAccount(acc.id);
                        }
                      }}
                      className="p-1 hover:bg-rose-500/10 rounded text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Account"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
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
                  {accountTrades.length} {accountTrades.length === 1 ? 'trade' : 'trades'} recorded
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
          onClick={openAddModal}
          className="border border-dashed border-white/[0.1] hover:border-blue-500/40 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[190px]"
        >
          <div className="w-8 h-8 rounded-md bg-white/[0.04] group-hover:bg-blue-500/10 border border-white/[0.08] group-hover:border-blue-500/25 flex items-center justify-center text-slate-400 group-hover:text-blue-400 transition-colors mb-2.5">
            <Plus className="w-4 h-4" strokeWidth={1.5} />
          </div>
          <h4 className="text-sm font-medium text-slate-200 group-hover:text-white">
            Add Another Account
          </h4>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xs">
            Configure an additional live broker, challenge account, or custom starting portfolio
          </p>
        </div>
      </div>

      {/* Account Create / Edit Modal */}
      {isAccountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#18181E] border border-white/[0.08] rounded-lg w-full max-w-md overflow-hidden">
            <div className="p-4 px-5 border-b border-white/[0.06] flex items-center justify-between bg-[#131317]">
              <h3 className="font-semibold text-white text-sm tracking-tight font-heading">
                {editingAccount ? 'Edit Account Configuration' : 'Add Trading Account'}
              </h3>
              <button
                onClick={() => setIsAccountModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="p-5 space-y-4">
              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Primary Account, FTMO 100k Challenge"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-[#131317] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Broker / Prop Firm
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FTMO, IC Markets"
                    value={formBroker}
                    onChange={(e) => setFormBroker(e.target.value)}
                    className="w-full bg-[#131317] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Account / Ticket ID
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1092841"
                    value={formAccountNumber}
                    onChange={(e) => setFormAccountNumber(e.target.value)}
                    className="w-full bg-[#131317] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Server / Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Live, Demo, Stage 1"
                    value={formServer}
                    onChange={(e) => setFormServer(e.target.value)}
                    className="w-full bg-[#131317] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                    Currency
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full bg-[#131317] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 font-mono"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1.5">
                  Initial Capital / Starting Balance
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">$</span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="10000"
                    value={formInitialBalance}
                    onChange={(e) => setFormInitialBalance(e.target.value)}
                    className="w-full bg-[#131317] border border-white/[0.08] rounded-md pl-7 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  All drawdown, profit percentage, and consistency metrics are computed from this baseline.
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAccountModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>{editingAccount ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
