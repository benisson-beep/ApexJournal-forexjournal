'use client';

import React from 'react';
import { Trade } from '../../types/trade';
import {
  calculateMistakeAnalytics,
  calculateSetupAnalytics,
  calculateSessionAnalytics,
} from '../../lib/analytics-math';
import { AlertTriangle, Award, Brain, Clock, ShieldAlert, Sparkles, Target, TrendingUp } from 'lucide-react';

interface PsychologyAnalyticsProps {
  trades: Trade[];
}

export const PsychologyAnalytics: React.FC<PsychologyAnalyticsProps> = ({ trades }) => {
  const { mistakes, totalMistakeLoss, cleanPnl } = calculateMistakeAnalytics(trades);
  const setups = calculateSetupAnalytics(trades);
  const sessions = calculateSessionAnalytics(trades);

  const currentNetPnl = trades.reduce((sum, t) => sum + t.netPnl, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* 1. Cost of Mistakes Hero Banner */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 mt-0.5">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Behavioral Discipline & Mistake Analysis
                </h3>
                <span className="text-[10px] uppercase font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded">
                  COST OF MISTAKES
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                By eliminating emotional executions, your Net P&L would jump from{' '}
                <strong className="text-slate-200 font-mono">${currentNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> to{' '}
                <strong className="text-emerald-400 font-mono">${cleanPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>.
              </p>
            </div>
          </div>

          <div className="bg-[#131929] border border-[#1b2336] rounded-xl p-3.5 px-5 text-right shrink-0">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Capital Surrendered to Mistakes
            </span>
            <span className="text-xl font-bold font-mono text-rose-400 tracking-tight">
              -${totalMistakeLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Mistakes Table */}
        <div className="mt-5 border-t border-[#1b2336] pt-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
            Mistake Impact Breakdown
          </span>
          {mistakes.length === 0 ? (
            <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Zero emotional mistakes logged! Flawless rule execution.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mistakes.map((m) => (
                <div
                  key={m.name}
                  className="bg-[#131929]/70 border border-[#1b2336] rounded-xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-rose-300">{m.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                      {m.tradeCount} {m.tradeCount === 1 ? 'trade' : 'trades'} · {m.winRate}% WR
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-rose-400">
                      -${m.totalLost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Setup Playbook Edge Matrix */}
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1b2336] flex items-center justify-between bg-[#0a0d14]/40">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
              Setup Playbook Statistical Edge
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {setups.length} active setups tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1b2336] bg-[#090d16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Setup Name</th>
                <th className="py-3 px-3 text-right">Trades</th>
                <th className="py-3 px-3 text-right">Win Rate %</th>
                <th className="py-3 px-3 text-right">Profit Factor</th>
                <th className="py-3 px-3 text-right">Avg R:R</th>
                <th className="py-3 px-4 text-right">Net Generated P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1b2336]/60">
              {setups.map((setup) => (
                <tr key={setup.name} className="hover:bg-[#131929]/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-200 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{setup.name}</span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {setup.tradeCount}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums">
                    <span
                      className={`font-semibold ${
                        setup.winRate >= 70
                          ? 'text-emerald-400'
                          : setup.winRate >= 50
                          ? 'text-slate-200'
                          : 'text-rose-400'
                      }`}
                    >
                      {setup.winRate}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {setup.profitFactor >= 99 ? '∞' : setup.profitFactor}
                  </td>
                  <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400 font-semibold">
                    +{setup.avgRMultiple}R
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                    <span
                      className={
                        setup.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }
                    >
                      {setup.netPnl >= 0 ? '+' : ''}${setup.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Session Edge Comparison Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Session Performance Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {sessions.map((sess) => {
            const isProfit = sess.netPnl > 0;
            return (
              <div
                key={sess.session}
                className="bg-[#0e131f] border border-[#1b2336] rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">{sess.session} Session</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sess.tradeCount} trades
                  </span>
                </div>

                <div>
                  <span
                    className={`text-lg font-bold font-mono tabular-nums tracking-tight block ${
                      isProfit ? 'text-emerald-400' : sess.netPnl < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}
                  >
                    {isProfit ? '+' : ''}${sess.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 font-mono">
                    <span>Win Rate: <strong className="text-slate-200">{sess.winRate}%</strong></span>
                    <span>·</span>
                    <span>PF: <strong className="text-slate-200">{sess.profitFactor >= 99 ? '∞' : sess.profitFactor}</strong></span>
                  </div>
                </div>

                <div className="w-full bg-[#1b2336] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-500"
                    style={{ width: `${sess.winRate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
