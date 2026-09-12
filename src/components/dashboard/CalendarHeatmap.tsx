'use client';

import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { buildMonthCalendar, DayPerformance } from '../../lib/analytics-math';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Calendar, Filter } from 'lucide-react';

interface CalendarHeatmapProps {
  trades: Trade[];
  onSelectDay: (dateStr: string | null) => void;
  selectedDateStr: string | null;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({
  trades,
  onSelectDay,
  selectedDateStr,
}) => {
  // Default to September 2026 (current sample data month)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 = September

  const weeks = buildMonthCalendar(trades, currentYear, currentMonth);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Month-wide totals
  const allDays = weeks.flatMap((w) => w.days.filter((d): d is DayPerformance => d !== null && d.tradeCount > 0));
  const monthNetPnl = allDays.reduce((sum, d) => sum + d.netPnl, 0);
  const greenDaysCount = allDays.filter((d) => d.netPnl > 0).length;
  const redDaysCount = allDays.filter((d) => d.netPnl < 0).length;
  const totalMonthTrades = allDays.reduce((sum, d) => sum + d.tradeCount, 0);

  return (
    <div className="bg-[#0e131f] border border-[#1b2336] rounded-xl overflow-hidden shadow-xl">
      {/* Calendar Header / Month Switcher */}
      <div className="p-4 border-b border-[#1b2336] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0d14]/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg bg-[#131929] border border-[#1b2336] hover:border-slate-600 text-slate-300 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-tight px-2 min-w-[140px] text-center">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg bg-[#131929] border border-[#1b2336] hover:border-slate-600 text-slate-300 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {selectedDateStr && (
            <button
              onClick={() => onSelectDay(null)}
              className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg hover:bg-emerald-500/20 transition-colors"
            >
              <Filter className="w-3 h-3" />
              <span>Filtering: {selectedDateStr} (Click to reset)</span>
            </button>
          )}
        </div>

        {/* Month Quick Summary Strip */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <div>
            <span className="text-slate-400 font-sans text-[11px] block">Month Net P&L</span>
            <span
              className={`font-bold text-sm ${
                monthNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {monthNetPnl >= 0 ? '+' : ''}${monthNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="h-6 w-px bg-[#1b2336]" />
          <div>
            <span className="text-slate-400 font-sans text-[11px] block">Daily Win/Loss</span>
            <span className="font-semibold text-slate-200">
              <span className="text-emerald-400">{greenDaysCount}G</span> /{' '}
              <span className="text-rose-400">{redDaysCount}R</span>
            </span>
          </div>
          <div className="h-6 w-px bg-[#1b2336]" />
          <div>
            <span className="text-slate-400 font-sans text-[11px] block">Volume</span>
            <span className="text-slate-300 font-semibold">{totalMonthTrades} trades</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Day of week headers + Weekly column */}
          <div className="grid grid-cols-8 border-b border-[#1b2336] bg-[#090d16] text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            <div className="py-2.5">Mon</div>
            <div className="py-2.5">Tue</div>
            <div className="py-2.5">Wed</div>
            <div className="py-2.5">Thu</div>
            <div className="py-2.5">Fri</div>
            <div className="py-2.5 text-slate-400">Sat</div>
            <div className="py-2.5 text-slate-400">Sun</div>
            <div className="py-2.5 bg-[#0e131f] border-l border-[#1b2336] text-emerald-400 font-bold">
              Weekly P&L
            </div>
          </div>

          {/* Week rows */}
          <div className="divide-y divide-[#1b2336]">
            {weeks.map((week) => (
              <div key={week.weekIndex} className="grid grid-cols-8 min-h-[95px]">
                {week.days.map((day, dIdx) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${week.weekIndex}-${dIdx}`}
                        className="bg-[#090c14]/40 border-r border-[#1b2336]/60 p-2"
                      />
                    );
                  }

                  const hasTrades = day.tradeCount > 0;
                  const isProfit = day.netPnl > 0;
                  const isLoss = day.netPnl < 0;
                  const isSelected = selectedDateStr === day.dateStr;

                  return (
                    <div
                      key={day.dateStr}
                      onClick={() => hasTrades && onSelectDay(isSelected ? null : day.dateStr)}
                      className={`border-r border-[#1b2336]/60 p-2 flex flex-col justify-between transition-all duration-150 relative ${
                        hasTrades ? 'cursor-pointer hover:brightness-110' : 'bg-transparent'
                      } ${
                        isSelected
                          ? 'ring-2 ring-emerald-500 bg-[#131929] z-10'
                          : hasTrades
                          ? isProfit
                            ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                            : isLoss
                            ? 'bg-rose-950/20 hover:bg-rose-950/30'
                            : 'bg-[#101522]'
                          : 'hover:bg-[#0c101a]'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-mono font-medium ${
                            hasTrades ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          {day.dayNumber}
                        </span>
                        {hasTrades && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {day.tradeCount} {day.tradeCount === 1 ? 'trade' : 'trades'}
                          </span>
                        )}
                      </div>

                      {/* P&L Display */}
                      {hasTrades ? (
                        <div className="my-auto text-center py-1">
                          <span
                            className={`text-xs font-bold font-mono tabular-nums tracking-tight block ${
                              isProfit ? 'text-emerald-400' : isLoss ? 'text-rose-400' : 'text-slate-300'
                            }`}
                          >
                            {isProfit ? '+' : ''}${day.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-mono">
                            {day.winningCount}W / {day.losingCount}L
                          </span>
                        </div>
                      ) : (
                        <div className="h-6" />
                      )}

                      {/* Small Bottom Status Accent */}
                      {hasTrades && (
                        <div
                          className={`h-0.5 w-full rounded-full ${
                            isProfit ? 'bg-emerald-500/60' : isLoss ? 'bg-rose-500/60' : 'bg-slate-600'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}

                {/* 8th Column: Weekly Total Summary */}
                <div className="bg-[#0b0f1a] border-l border-[#1b2336] p-2.5 flex flex-col justify-between">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    W{week.weekIndex} Total
                  </div>

                  <div className="my-auto text-center">
                    <span
                      className={`text-xs font-bold font-mono tabular-nums tracking-tight block ${
                        week.totalNetPnl > 0
                          ? 'text-emerald-400'
                          : week.totalNetPnl < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {week.totalNetPnl > 0 ? '+' : ''}${week.totalNetPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                      {week.totalTrades} {week.totalTrades === 1 ? 'trade' : 'trades'}
                    </span>
                  </div>

                  <div className="text-center">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider ${
                        week.totalNetPnl > 0
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : week.totalNetPnl < 0
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'text-slate-400'
                      }`}
                    >
                      {week.totalNetPnl > 0 ? 'WIN' : week.totalNetPnl < 0 ? 'LOSS' : 'FLAT'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
