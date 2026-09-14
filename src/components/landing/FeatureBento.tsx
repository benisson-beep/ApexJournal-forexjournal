'use client';

import React from 'react';
import { Brain, Calendar, Database, ShieldAlert, Target, Terminal, TrendingUp, Zap } from 'lucide-react';

export const FeatureBento: React.FC = () => {
  return (
    <section id="features" className="py-24 px-6 max-w-[1280px] mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          Institutional Feature Suite
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Everything You Need to Trade Like a Quant Firm
        </h2>
        <p className="text-sm text-slate-400">
          Generic spreadsheets and AI templates don't understand lot sizing, pip mechanics, or psychological discipline. ApexJournal was engineered specifically for serious Forex traders.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Bento 1: Real-Time Auto-Sync (Col Span 2) */}
        <div className="md:col-span-2 bg-black border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="space-y-3 max-w-md relative z-10">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Real-Time MT4 & MT5 Auto-Sync Webhook
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drop our lightweight EA into your MetaTrader Experts folder. Every time you open, modify, or close a trade on desktop or mobile, it instantly transmits ticket details to your journal in under 200 milliseconds.
            </p>
          </div>

          {/* Code/Terminal Preview Graphic */}
          <div className="mt-6 bg-[#080c14] border border-white/10 rounded-xl p-4 font-mono text-[11px] text-slate-300 space-y-1.5 shadow-inner">
            <div className="flex items-center justify-between text-slate-500 border-b border-white/10 pb-2 mb-2 text-[10px]">
              <span>POST /api/sync/trade</span>
              <span className="text-emerald-400">200 OK (142ms)</span>
            </div>
            <p><span className="text-purple-400">&#123;</span></p>
            <p className="pl-4"><span className="text-slate-400">"ticket":</span> <span className="text-amber-300">"74819201"</span>,</p>
            <p className="pl-4"><span className="text-slate-400">"symbol":</span> <span className="text-emerald-400">"EURUSD"</span>,</p>
            <p className="pl-4"><span className="text-slate-400">"direction":</span> <span className="text-emerald-400">"BUY"</span>, <span className="text-slate-400">"lots":</span> <span className="text-amber-300">5.0</span>,</p>
            <p className="pl-4"><span className="text-slate-400">"pips":</span> <span className="text-emerald-400">+52.0</span>, <span className="text-slate-400">"rMultiple":</span> <span className="text-emerald-400">+2.60R</span>,</p>
            <p className="pl-4"><span className="text-slate-400">"netPnl":</span> <span className="text-emerald-400">+$2,552.50</span></p>
            <p><span className="text-purple-400">&#125;</span></p>
          </div>
        </div>

        {/* Bento 2: Behavioral Psychology & Cost of Mistakes */}
        <div className="bg-black border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-colors">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Measure Your Exact "Cost of Mistakes"
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tag your emotional mistakes like FOMO, revenge trading, or moving stop losses. ApexJournal quantifies the exact dollar amount you surrender to undisciplined executions.
            </p>
          </div>

          <div className="mt-6 bg-[#080c14] border border-white/10 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-300 font-semibold">#FOMO Entry</span>
              <span className="text-rose-400 font-mono font-bold">-$1,041.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-rose-300 font-semibold">#Moved Stop Loss</span>
              <span className="text-rose-400 font-mono font-bold">-$948.00</span>
            </div>
            <div className="border-t border-white/10 pt-2 mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Theoretical Clean P&L:</span>
              <span className="text-emerald-400 font-mono font-bold">+$11,850.00</span>
            </div>
          </div>
        </div>

        {/* Bento 3: P&L Calendar Heatmap */}
        <div className="bg-black border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-colors">
          <div className="space-y-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              P&L Calendar with Weekly Rollups
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Visualize green vs red days instantly. Track your weekly consistency with dedicated weekly net profit rollups and one-click date filtering.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-4 gap-2 text-center text-xs font-mono">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Mon</span>
              <span className="text-emerald-400 font-bold">+$994</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Tue</span>
              <span className="text-emerald-400 font-bold">+$3,305</span>
            </div>
            <div className="bg-rose-950/20 border border-rose-500/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Wed</span>
              <span className="text-rose-400 font-bold">-$948</span>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Thu</span>
              <span className="text-emerald-400 font-bold">+$4,050</span>
            </div>
          </div>
        </div>

        {/* Bento 4: Setup Playbook Statistical Edge (Col Span 2) */}
        <div className="md:col-span-2 bg-black border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between group hover:border-white/20 transition-colors">
          <div className="space-y-3 max-w-md">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-slate-100">
              Setup Playbook Win Rate & R:R Matrix
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Find your highest probability setups. Compare ICT Silver Bullet, Liquidity Sweeps, and Break & Retest strategies by realized Profit Factor and average R:R multiple.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-[#080c14] border border-white/10 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Liquidity Sweep</span>
                <span className="text-[11px] text-slate-400 block font-mono">100% Win Rate · +2.41R</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">+$5,857.50</span>
            </div>

            <div className="bg-[#080c14] border border-white/10 p-3 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200">Silver Bullet</span>
                <span className="text-[11px] text-slate-400 block font-mono">100% Win Rate · +1.88R</span>
              </div>
              <span className="text-emerald-400 font-mono font-bold">+$1,480.00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
