'use client';

import React, { useState } from 'react';
import { Trade, TradingAccount } from '../../types/trade';
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
  account: TradingAccount;
  trades: Trade[];
  stats: {
    winRate: number;
    profitFactor: number;
    totalPnl: number;
    totalTrades: number;
    avgRr: number;
    maxDrawdownPercent: number;
  };
}

export const ProfileView: React.FC<ProfileViewProps> = ({ account, trades, stats }) => {
  const [traderName, setTraderName] = useState('Alex Vance');
  const [traderBio, setTraderBio] = useState(
    'Discretionary FX & Commodities trader focused on liquidity sweeps, session open volume, and strict 1:2+ R:R execution.'
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

  const toggleRule = (id: number) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r))
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const winningTrades = trades.filter((t) => t.netPnl > 0);
  const losingTrades = trades.filter((t) => t.netPnl < 0);
  const bestTrade = trades.reduce((max, t) => (t.netPnl > max ? t.netPnl : max), 0);

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="bg-[#080c14] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* Avatar and Details */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center text-white font-extrabold text-2xl ring-4 ring-emerald-500/20">
                AV
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 bg-[#00c97b] text-black text-[10px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-black flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3 stroke-[3]" />
                <span>PRO</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                {isEditing ? (
                  <input
                    type="text"
                    value={traderName}
                    onChange={(e) => setTraderName(e.target.value)}
                    className="bg-black/60 border border-emerald-500/40 text-white font-bold text-lg px-2 py-0.5 rounded focus:outline-none"
                  />
                ) : (
                  <h2 className="text-xl font-extrabold text-white tracking-tight">{traderName}</h2>
                )}
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Funded Master
                </span>
              </div>

              {isEditing ? (
                <textarea
                  value={traderBio}
                  onChange={(e) => setTraderBio(e.target.value)}
                  className="w-full mt-2 bg-black/60 border border-emerald-500/40 text-xs text-slate-300 p-2 rounded focus:outline-none"
                  rows={2}
                />
              ) : (
                <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                  {traderBio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-400 font-mono">
                <span className="flex items-center gap-1 text-slate-300">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Apex Tier 3 Trader</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>London / NY Session</span>
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold">
                  Member since Jan 2024
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-1.5 bg-[#101624] hover:bg-[#182236] border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-400" />
              <span>{isEditing ? 'Save Profile' : 'Edit Profile'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 bg-[#00c97b] hover:bg-emerald-400 text-black text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share Profile'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 4 Core Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#080c14] border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Lifetime Net P&L</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className={`text-xl font-mono font-black ${stats.totalPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {stats.totalPnl >= 0 ? '+' : ''}${stats.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Across {stats.totalTrades} documented trades
          </div>
        </div>

        <div className="bg-[#080c14] border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Win Rate</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl font-mono font-black text-white">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            {winningTrades.length} Wins · {losingTrades.length} Losses
          </div>
        </div>

        <div className="bg-[#080c14] border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Profit Factor</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-mono font-black text-white">
            {stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Best Win: +${bestTrade.toLocaleString('en-US')}
          </div>
        </div>

        <div className="bg-[#080c14] border border-white/10 p-4 rounded-xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Avg R:R Multiplier</span>
            <BarChart3 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-mono font-black text-emerald-300">
            {stats.avgRr.toFixed(2)}R
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-mono">
            Target benchmark: 2.0R+
          </div>
        </div>
      </div>

      {/* Row 2: Prop Firm Challenge Monitor & Trading Playbook */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prop Firm Tracker */}
        <div className="bg-[#080c14] border border-white/10 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Prop Firm Challenge Compliance</span>
                <span className="text-[10px] font-mono uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monitoring rules for {account.broker} · #{account.accountNumber}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              PASSED STAGE 2
            </span>
          </div>

          {/* Metric 1: Profit Target */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Profit Target Progress (10% Target)</span>
              <span className="text-emerald-400 font-bold">8.4% / 10.0% ($16,800 / $20,000)</span>
            </div>
            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: '84%' }} />
            </div>
          </div>

          {/* Metric 2: Max Daily Drawdown Buffer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Daily Drawdown Buffer (5.0% Limit)</span>
              <span className="text-slate-200 font-bold">0.45% Lost Today (Safe)</span>
            </div>
            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '9%' }} />
            </div>
            <p className="text-[10px] text-slate-400">Remaining daily cushion: $9,100</p>
          </div>

          {/* Metric 3: Max Overall Drawdown Buffer */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">Maximum Trailing Drawdown (10.0% Limit)</span>
              <span className="text-slate-200 font-bold">1.82% Max Trailing Drawdown</span>
            </div>
            <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-white/10">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: '18%' }} />
            </div>
            <p className="text-[10px] text-slate-400">Drawdown distance to liquidation: $16,360</p>
          </div>
        </div>

        {/* Strategy Playbook & Preferred Instruments */}
        <div className="bg-[#080c14] border border-white/10 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Strategy & Instrument Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Trader execution guidelines and asset allocations</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Primary Asset</span>
              <p className="text-sm font-bold text-white mt-0.5">EUR/USD & XAU/USD</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">72% win rate on Gold</p>
            </div>
            <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Execution Setup</span>
              <p className="text-sm font-bold text-white mt-0.5">FVG Liquidity Sweep</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">15m order blocks on 1m</p>
            </div>
            <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Session Window</span>
              <p className="text-sm font-bold text-white mt-0.5">London / NY Overlap</p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">12:00 — 16:00 UTC</p>
            </div>
            <div className="p-3 bg-black/50 border border-white/5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Risk Engine</span>
              <p className="text-sm font-bold text-white mt-0.5">Fixed 1.0% Model</p>
              <p className="text-[10px] text-emerald-400 font-mono mt-1">Compounding threshold</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Trading Discipline & Daily Rules Checklist */}
      <div className="bg-[#080c14] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Trader Discipline & Operational Rules Checklist</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                {rules.filter((r) => r.checked).length} / {rules.length} Compliant
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily habit adherence to eliminate tilt and prevent psychological drawdowns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {rules.map((rule) => (
            <div
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                rule.checked
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                  : 'bg-black/40 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 ${
                  rule.checked
                    ? 'bg-emerald-500 border-emerald-400 text-black'
                    : 'border-slate-600 bg-black'
                }`}
              >
                {rule.checked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
              <span className="text-xs font-medium">{rule.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
