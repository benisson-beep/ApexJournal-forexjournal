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
    <div className="space-y-6">
      {/* 1. Cost of Mistakes Hero Banner */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
                Behavioral Discipline & Mistake Analysis
              </h3>
              <span className="text-[10px] uppercase font-mono font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                Mistake Capital Loss
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              By eliminating emotional executions, your Net P&L would elevate from{' '}
              <strong className="text-slate-200 font-mono">${currentNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> to{' '}
              <strong className="text-emerald-400 font-mono">${cleanPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong>.
            </p>
          </div>

          <div className="bg-[#18181E] border border-white/[0.06] rounded-md p-3 px-4 text-right shrink-0">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">
              Surrendered to Mistakes
            </span>
            <span className="text-xl font-bold font-mono text-rose-400 tracking-tight tabular-nums">
              -${totalMistakeLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Mistakes Table */}
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-3">
            Mistake Impact Breakdown
          </span>
          {mistakes.length === 0 ? (
            <div className="text-xs text-slate-300 bg-white/[0.03] border border-white/[0.06] p-3 rounded-md">
              <span>Zero emotional mistakes logged. Discipline rules respected.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mistakes.map((m) => (
                <div
                  key={m.name}
                  className="bg-[#18181E] border border-white/[0.06] rounded-md p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-medium text-rose-300">#{m.name}</span>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                      {m.tradeCount} {m.tradeCount === 1 ? 'trade' : 'trades'} · {m.winRate}% WR
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold font-mono text-rose-400 tabular-nums">
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
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg overflow-hidden">
        <div className="p-3.5 px-4 border-b border-white/[0.06] flex items-center justify-between bg-[#18181E]">
          <div>
            <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
              Setup Playbook Statistical Edge
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {setups.length} active setups tracked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#18181E] text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-4">Setup Name</th>
                <th className="py-2.5 px-3 text-right">Trades</th>
                <th className="py-2.5 px-3 text-right">Win Rate %</th>
                <th className="py-2.5 px-3 text-right">Profit Factor</th>
                <th className="py-2.5 px-3 text-right">Avg R:R</th>
                <th className="py-2.5 px-4 text-right">Net Generated P&L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {setups.map((setup) => (
                <tr key={setup.name} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-2.5 px-4 font-medium text-slate-200">
                    {setup.name}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {setup.tradeCount}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                    {setup.winRate}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-300">
                    {setup.profitFactor >= 99 ? '∞' : setup.profitFactor}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-400 font-medium">
                    +{setup.avgRMultiple}R
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono tabular-nums font-bold">
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
        <div className="mb-2.5">
          <h3 className="text-xs font-heading font-semibold text-slate-300 uppercase tracking-wider">
            Session Performance Breakdown
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sessions.map((sess) => {
            const isProfit = sess.netPnl > 0;
            return (
              <div
                key={sess.session}
                className="bg-[#131317] border border-white/[0.06] rounded-md p-3.5 flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-200">{sess.session} Session</span>
                  <span className="text-[10px] text-slate-500 font-mono">
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

                <div className="w-full bg-[#18181E] h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300"
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
