'use client';

import React, { useState } from 'react';
import { Trade, TradingAccount, AccountStats } from '../../types/trade';
import {
  ShieldCheck,
  Award,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2,
  Flame,
  Share2,
  Edit3,
  BarChart3,
} from 'lucide-react';

interface ProfileViewProps {
  account?: TradingAccount | null;
  trades: Trade[];
  stats: AccountStats;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ account, trades, stats }) => {
  const [traderName, setTraderName] = useState('Trader');
  const [traderBio, setTraderBio] = useState(
    'Discretionary trader focused on liquidity sweeps, session momentum, and strict risk execution.'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Discipline checklist state
  const [rules, setRules] = useState([
    { id: 1, text: 'Strict 1.0% max risk per execution', checked: true },
    { id: 2, text: 'No entries within 15 min of red folder CPI / NFP news', checked: true },
    { id: 3, text: 'Hard stop loss set immediately upon entry — never widened', checked: true },
    { id: 4, text: 'Max 2 trades per session (London / New York)', checked: true },
    { id: 5, text: 'Take full profit or scale out at predetermined liquidity target', checked: false },
  ]);

  // Sync profile & rules with localStorage
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedName = localStorage.getItem('apex_profile_name');
    if (savedName) setTraderName(savedName);
    const savedBio = localStorage.getItem('apex_profile_bio');
    if (savedBio) setTraderBio(savedBio);
    const savedRules = localStorage.getItem('apex_profile_rules');
    if (savedRules) {
      try {
        setRules(JSON.parse(savedRules));
      } catch (e) {}
    }
  }, []);

  const handleSaveProfile = () => {
    setIsEditing(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('apex_profile_name', traderName);
      localStorage.setItem('apex_profile_bio', traderBio);
    }
  };

  const toggleRule = (id: number) => {
    setRules((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r));
      if (typeof window !== 'undefined') {
        localStorage.setItem('apex_profile_rules', JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winningTrades = trades.filter((t) => t.netPnl > 0);
  const losingTrades = trades.filter((t) => t.netPnl < 0);
  const bestTrade = trades.reduce((max, t) => (t.netPnl > max ? t.netPnl : max), 0);

  // Dynamic Avatar Initials
  const initials =
    traderName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TR';

  // Dynamic Strategy Matrix
  const symbolMap: Record<string, { count: number; wins: number }> = {};
  const setupMap: Record<string, number> = {};
  const sessionMap: Record<string, number> = {};

  trades.forEach((t) => {
    const sym = t.symbol.toUpperCase();
    if (!symbolMap[sym]) symbolMap[sym] = { count: 0, wins: 0 };
    symbolMap[sym].count += 1;
    if (t.netPnl > 0) symbolMap[sym].wins += 1;

    t.tags?.forEach((tag) => {
      if (tag.type === 'SETUP') {
        setupMap[tag.name] = (setupMap[tag.name] || 0) + 1;
      }
    });

    if (t.session) {
      sessionMap[t.session] = (sessionMap[t.session] || 0) + 1;
    }
  });

  let topSymbol = '—';
  let topSymbolWinRate = '0%';
  let topSymbolMax = 0;
  Object.entries(symbolMap).forEach(([sym, data]) => {
    if (data.count > topSymbolMax) {
      topSymbol = sym;
      topSymbolMax = data.count;
      topSymbolWinRate = `${((data.wins / data.count) * 100).toFixed(0)}%`;
    }
  });

  let topSetup = '—';
  let topSetupMax = 0;
  Object.entries(setupMap).forEach(([name, count]) => {
    if (count > topSetupMax) {
      topSetup = name;
      topSetupMax = count;
    }
  });

  let topSession = '—';
  let topSessionMax = 0;
  Object.entries(sessionMap).forEach(([sess, count]) => {
    if (count > topSessionMax) {
      topSession = sess;
      topSessionMax = count;
    }
  });

  // Dynamic Prop Firm / Risk Calculations
  const initBal = account?.initialBalance || 10000;
  const targetProfit = initBal * 0.1;
  const currentProfit = stats.netPnl;
  const targetProgressPct = targetProfit > 0 ? (currentProfit / targetProfit) * 100 : 0;
  const clampedProgressPct = Math.max(0, Math.min(100, targetProgressPct));

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTrades = trades.filter((t) => (t.closeTime || t.openTime).startsWith(todayStr));
  const todayLoss = Math.abs(
    todayTrades.reduce((sum, t) => (t.netPnl < 0 ? sum + t.netPnl : sum), 0)
  );
  const dailyLimit = initBal * 0.05;
  const dailyLossPct = initBal > 0 ? (todayLoss / initBal) * 100 : 0;
  const remainingDailyCushion = Math.max(0, dailyLimit - todayLoss);
  const dailyDrawdownProgress = Math.min(100, (dailyLossPct / 5) * 100);

  const maxOverallLimit = initBal * 0.1;
  const currentDDAmount = (stats.maxDrawdown / 100) * initBal;
  const remainingOverallCushion = Math.max(0, maxOverallLimit - currentDDAmount);
  const overallDrawdownProgress = Math.min(100, (stats.maxDrawdown / 10) * 100);

  return (
    <div className="space-y-6">
      {/* Trader Identity Card */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 sm:p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar and Details */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#18181E] border border-white/[0.08] flex items-center justify-center text-slate-100 font-heading font-bold text-xl shrink-0">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    className="bg-[#18181E] border border-white/[0.12] text-white font-medium text-base px-2 py-0.5 rounded-md focus:outline-none"
                  />
                ) : (
                  <h2 className="text-lg font-heading font-bold text-white tracking-tight">{traderName}</h2>
                )}
              </div>

              {isEditing ? (
                <textarea
                  value={traderBio}
                  onChange={(e) => setTraderBio(e.target.value)}
                  className="w-full mt-2 bg-[#18181E] border border-white/[0.1] text-xs text-slate-300 p-2 rounded-md focus:outline-none"
                  rows={2}
                />
              ) : (
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  {traderBio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-slate-400 font-mono">
                <span className="text-slate-300">
                  {account ? `${account.broker} · ${account.currency}` : 'Active Portfolio'}
                </span>
                <span>·</span>
                <span>{topSession !== '—' ? `${topSession} Session` : 'All Sessions'}</span>
                <span>·</span>
                <span className="text-slate-400 font-mono">
                  {trades.length} Documented {trades.length === 1 ? 'Trade' : 'Trades'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => {
                if (isEditing) {
                  handleSaveProfile();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-1.5 bg-[#18181E] hover:bg-[#202027] border border-white/[0.06] hover:border-white/[0.12] text-slate-200 text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.5} />
              <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Lifetime Net P&L
          </span>
          <div className={`text-xl font-mono font-bold tabular-nums ${stats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.netPnl >= 0 ? '+' : ''}${stats.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {stats.totalTrades} documented trades
          </div>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Win Rate
          </span>
          <div className="text-xl font-mono font-bold text-white tabular-nums">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            {winningTrades.length} Wins · {losingTrades.length} Losses
          </div>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Profit Factor
          </span>
          <div className="text-xl font-mono font-bold text-white tabular-nums">
            {stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Best Win: +${bestTrade.toLocaleString('en-US')}
          </div>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] p-3.5 rounded-md">
          <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
            Avg R:R Multiplier
          </span>
          <div className="text-xl font-mono font-bold text-emerald-400 tabular-nums">
            {stats.avgRMultiple.toFixed(2)}R
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
            Target benchmark: 2.0R+
          </div>
        </div>
      </div>

      {/* Row 2: Prop Firm Challenge Monitor & Trading Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Prop Firm Tracker */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-heading font-semibold text-white flex items-center gap-2">
                <span>Prop Firm Challenge Compliance</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring rules for {account ? `${account.broker} · #${account.accountNumber}` : 'Active Portfolio'}
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-300 bg-white/[0.04] border border-white/[0.08] px-2.5 py-1 rounded-md">
              {currentProfit >= targetProfit ? 'Target Achieved' : 'In Progress'}
            </span>
          </div>

          {/* Metric 1: Profit Target */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Profit Target Progress (10% Target)</span>
              <span className="text-emerald-400 font-medium">
                {((currentProfit / (initBal || 1)) * 100).toFixed(1)}% / 10.0% ({currentProfit >= 0 ? '+' : ''}${currentProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })} / ${targetProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })})
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#18181E] rounded-full overflow-hidden border border-white/[0.06]">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${clampedProgressPct}%` }} />
            </div>
          </div>

          {/* Metric 2: Max Daily Drawdown Buffer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Daily Drawdown Buffer (5.0% Limit)</span>
              <span className="text-slate-300 font-medium">
                {dailyLossPct.toFixed(2)}% Lost Today ({dailyLossPct > 4 ? 'Warning' : 'Safe'})
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#18181E] rounded-full overflow-hidden border border-white/[0.06]">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dailyDrawdownProgress}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Remaining daily cushion: ${remainingDailyCushion.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>

          {/* Metric 3: Max Overall Drawdown Buffer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Maximum Trailing Drawdown (10.0% Limit)</span>
              <span className="text-slate-300 font-medium">
                {stats.maxDrawdown}% Max Drawdown
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#18181E] rounded-full overflow-hidden border border-white/[0.06]">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${overallDrawdownProgress}%` }} />
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              Drawdown cushion to liquidation: ${remainingOverallCushion.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Strategy Playbook & Preferred Instruments */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
          <div>
            <h3 className="text-sm font-heading font-semibold text-white">Strategy & Instrument Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Trader execution guidelines and asset allocations</p>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 bg-[#18181E] border border-white/[0.04] rounded-md">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Primary Asset</span>
              <p className="text-sm font-medium text-white mt-0.5">
                {topSymbol !== '—' ? topSymbol : 'No trades yet'}
              </p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">
                {topSymbol !== '—' ? `${topSymbolWinRate} win rate (${topSymbolMax} deals)` : 'Awaiting executions'}
              </p>
            </div>
            <div className="p-3 bg-[#18181E] border border-white/[0.04] rounded-md">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Execution Setup</span>
              <p className="text-sm font-medium text-white mt-0.5">
                {topSetup !== '—' ? topSetup : 'No setups tagged'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {topSetup !== '—' ? `${topSetupMax} trades logged` : 'Tag trades to track edge'}
              </p>
            </div>
            <div className="p-3 bg-[#18181E] border border-white/[0.04] rounded-md">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Session Window</span>
              <p className="text-sm font-medium text-white mt-0.5">
                {topSession !== '—' ? `${topSession} Session` : 'All Sessions'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {topSession !== '—' ? `${topSessionMax} trades logged` : 'Global trading hours'}
              </p>
            </div>
            <div className="p-3 bg-[#18181E] border border-white/[0.04] rounded-md">
              <span className="text-[10px] text-slate-400 uppercase font-medium">Risk Engine</span>
              <p className="text-sm font-medium text-white mt-0.5">
                {stats.avgLoss > 0 ? `Avg Loss -$${stats.avgLoss.toFixed(0)}` : '1.0% Risk Model'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {stats.avgRMultiple > 0 ? `Realized R:R +${stats.avgRMultiple}R` : 'Benchmark: 1:2 R:R'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Trading Discipline & Daily Rules Checklist */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-heading font-semibold text-white flex items-center gap-2">
              <span>Trader Discipline & Operational Rules Checklist</span>
              <span className="text-[10px] text-slate-300 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded font-mono">
                {rules.filter((r) => r.checked).length} / {rules.length} Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily habit adherence to eliminate tilt and prevent psychological drawdowns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {rules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className={`flex items-center gap-3 p-2.5 rounded-md border transition-colors cursor-pointer ${
                rule.checked
                  ? 'bg-blue-600/[0.06] border-blue-500/25 text-slate-200'
                  : 'bg-[#18181E] border-white/[0.04] text-slate-400 hover:border-white/[0.1]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                  rule.checked
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'border-slate-600 bg-black/40'
                }`}
              >
                {rule.checked && <CheckCircle2 className="w-3 h-3" strokeWidth={2} />}
              </div>
              <span className="text-xs font-medium">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
