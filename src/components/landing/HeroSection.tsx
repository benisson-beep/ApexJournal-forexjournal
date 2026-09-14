'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BarChart2,
  CheckCircle2,
  DollarSign,
  Play,
  Shield,
  Target,
  Zap,
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-16 pb-20 px-6 overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-[1280px] mx-auto text-center space-y-8 relative z-10">
        {/* Eyebrow Pill */}
        <div className="inline-flex items-center gap-2 bg-black border border-white/10 px-3 py-1.5 rounded-full text-xs text-slate-300 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">MetaTrader 4 & 5 Real-Time Webhook Sync</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            Live v1.2 <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 tracking-tight leading-[1.1]">
            Stop Leaking Capital to FOMO.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500">
              The Journal That Proves Your Edge.
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Automate trade tracking directly from MT4 & MT5 in sub-seconds. Pinpoint your exact{' '}
            <strong className="text-slate-200">Cost of Mistakes</strong>, session win rates, and realized R-Multiples—zero manual spreadsheets required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/dashboard"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] font-bold text-sm px-7 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/25"
          >
            <span>Launch Live Demo</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>

          <a
            href="#pricing"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-black hover:bg-[#0c1018] border border-white/10 hover:border-white/30 text-slate-200 font-semibold text-sm px-6 py-3.5 rounded-xl transition-colors"
          >
            <span>View Pricing & Tiers</span>
          </a>
        </div>

        {/* Key Guarantee Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero broker passwords stored</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Prop-Firm Compliant (FTMO, Apex)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant 3-minute setup</span>
          </div>
        </div>

        {/* Product Showcase Mockup */}
        <div className="pt-8">
          <div className="bg-[#080c14] border border-white/10 rounded-2xl shadow-2xl p-2.5 max-w-5xl mx-auto overflow-hidden">
            {/* Terminal Window Header Bar */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-black rounded-t-xl mb-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                <span className="font-mono text-[11px] text-slate-400 ml-2">apexjournal.app/dashboard</span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ● LIVE SYNC ACTIVE
              </div>
            </div>

            {/* Inner Dashboard Preview */}
            <div className="p-4 sm:p-6 space-y-4 bg-black rounded-xl text-left">
              {/* Top Quick Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#080c14] border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Net P&L</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">+$10,382.50</span>
                  <span className="text-[10px] text-emerald-400 block mt-1">+10.38% return</span>
                </div>

                <div className="bg-[#080c14] border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Win Rate</span>
                  <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">71.4%</span>
                  <span className="text-[10px] text-slate-400 block mt-1">5 Wins · 2 Losses</span>
                </div>

                <div className="bg-[#080c14] border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Profit Factor</span>
                  <span className="text-xl font-bold font-mono text-slate-100 tabular-nums">3.42</span>
                  <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">EXCELLENT</span>
                </div>

                <div className="bg-[#080c14] border border-white/10 p-3.5 rounded-xl">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Avg Realized R:R</span>
                  <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">+2.15R</span>
                  <span className="text-[10px] text-slate-400 block mt-1">per winning trade</span>
                </div>
              </div>

              {/* Sample Deal Table Snippet */}
              <div className="bg-[#080c14] border border-white/10 rounded-xl overflow-hidden text-xs">
                <div className="p-3 px-4 border-b border-white/10 bg-black flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase">
                  <span>Recent Executed Trades</span>
                  <span className="text-emerald-400 font-mono">Synced from MT5 Terminal</span>
                </div>

                <div className="divide-y divide-white/10">
                  <div className="p-3 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-200">EURUSD</span>
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                        BUY 5.0L
                      </span>
                      <span className="text-slate-400 hidden sm:inline text-[11px]">1.08420 $\rightarrow$ 1.08940</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-mono hidden md:inline text-[11px]">+52.0 pips</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded">
                        +$2,552.50
                      </span>
                    </div>
                  </div>

                  <div className="p-3 px-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-200">XAUUSD</span>
                      <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                        SELL 2.5L
                      </span>
                      <span className="text-slate-400 hidden sm:inline text-[11px]">2518.40 $\rightarrow$ 2502.10</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-mono hidden md:inline text-[11px]">+163.0 pips</span>
                      <span className="text-emerald-400 font-mono font-bold text-xs bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded">
                        +$4,050.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
