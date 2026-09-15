'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

export const PricingSection: React.FC = () => {
  const [annualBilling, setAnnualBilling] = useState(true);

  return (
    <section id="pricing" className="py-24 px-6 max-w-[1280px] mx-auto space-y-12">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 tracking-tight">
          Invest in Your Trading Discipline
        </h2>
        <p className="text-sm text-slate-400">
          One prevented FOMO trade covers an entire year of ApexJournal Pro. Choose the plan that fits your trading journey.
        </p>

        {/* Annual / Monthly Toggle */}
        <div className="pt-3 flex items-center justify-center gap-3 text-xs font-semibold">
          <span className={!annualBilling ? 'text-slate-200' : 'text-slate-400'}>Monthly</span>
          <button
            onClick={() => setAnnualBilling(!annualBilling)}
            className="w-12 h-6 bg-black border border-white/10 rounded-full p-1 transition-colors relative cursor-pointer"
          >
            <div
              className={`w-4 h-4 bg-emerald-500 rounded-full transition-transform ${
                annualBilling ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={annualBilling ? 'text-slate-200' : 'text-slate-400'}>
            Annual <span className="text-emerald-400 font-bold">(Save 20%)</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Tier 1: Free Starter */}
        <div className="bg-black border border-white/10 rounded-2xl p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Starter</h3>
              <p className="text-xs text-slate-400 mt-1">For beginners testing trade journaling.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-slate-100">$0</span>
              <span className="text-xs text-slate-400 font-sans">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to 30 trades per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1 Connected Trading Account</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Manual Trade Logging Modal</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Basic Win Rate & Net P&L metrics</span>
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <span className="w-4 text-center">—</span>
                <span>No real-time MT4/MT5 Webhook</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="w-full text-center bg-[#0c1018] hover:bg-[#131929] border border-white/10 text-slate-200 font-semibold text-xs py-3 rounded-xl transition-colors block"
          >
            Get Started Free
          </Link>
        </div>

        {/* Tier 2: Pro Trader (Featured) */}
        <div className="bg-black border-2 border-emerald-500/50 rounded-2xl p-7 flex flex-col justify-between space-y-6 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-[#080b11] font-extrabold text-[10px] tracking-widest uppercase px-3 py-0.5 rounded-full">
            Most Popular
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Pro Trader</span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold uppercase">
                  UNLIMITED
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">For serious retail & prop firm challenge traders.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-emerald-400">
                ${annualBilling ? '24' : '29'}
              </span>
              <span className="text-xs text-slate-400 font-sans">
                / month {annualBilling ? '(billed $288/yr)' : ''}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-200 pt-3 border-t border-white/10">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <strong className="text-slate-100">Unlimited Trades & Accounts</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <strong className="text-emerald-400">Real-Time MT4 & MT5 Auto-Sync EA</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Monthly P&L Calendar Heatmap + Weekly Totals</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>"Cost of Mistakes" & Discipline Analyzer</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Setup Playbook Win Rate & R:R Matrix</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>MT4/MT5 CSV & HTML Detailed Report Importer</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="w-full text-center bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] font-bold text-xs py-3 rounded-xl transition-all block"
          >
            Start 7-Day Free Trial
          </Link>
        </div>

        {/* Tier 3: Prop Desk / Team */}
        <div className="bg-black border border-white/10 rounded-2xl p-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Prop Desk / Team</h3>
              <p className="text-xs text-slate-400 mt-1">For prop firm teams, syndicates & trading mentors.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold font-mono text-slate-100">
                ${annualBilling ? '69' : '79'}
              </span>
              <span className="text-xs text-slate-400 font-sans">/ month</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300 pt-3 border-t border-white/10">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Everything in Pro Plan</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Up to 15 Connected MT4/MT5 Accounts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Risk Manager & Max Drawdown Alerts</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mentor Read-Only Shareable Dashboards</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Priority 1-on-1 Support</span>
              </li>
            </ul>
          </div>

          <Link
            href="/dashboard"
            className="w-full text-center bg-[#0c1018] hover:bg-[#131929] border border-white/10 text-slate-200 font-semibold text-xs py-3 rounded-xl transition-colors block"
          >
            Contact Prop Desk Team
          </Link>
        </div>
      </div>
    </section>
  );
};
