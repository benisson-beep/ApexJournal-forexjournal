'use client';

import React, { useState } from 'react';
import { Trade } from '../../types/trade';
import { buildMonthCalendar, DayPerformance } from '../../lib/analytics-math';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

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
  // Dynamically default to the most recent trade's month, or current month if empty
  const defaultDate = React.useMemo(() => {
    if (trades.length > 0) {
      const sorted = [...trades].sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
      const d = new Date(sorted[0].closeTime);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [trades]);

  const [currentYear, setCurrentYear] = useState(() => defaultDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => defaultDate.getMonth());

  // Automatically keep current month in view when trades are added
  React.useEffect(() => {
    if (trades.length > 0) {
      const sorted = [...trades].sort((a, b) => new Date(b.closeTime).getTime() - new Date(a.closeTime).getTime());
      const d = new Date(sorted[0].closeTime);
      if (!isNaN(d.getTime())) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [trades]);

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

  const handleGoToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
  };

  // Month-wide totals
  const allTradingDays = weeks.flatMap((w) => w.days.filter((d): d is DayPerformance => d !== null && d.tradeCount > 0));
  const monthNetPnl = allTradingDays.reduce((sum, d) => sum + d.netPnl, 0);
  const tradingDaysCountThisMonth = allTradingDays.length;

  return (
    <div className="space-y-4">
      {/* 1. Top Navigation Bar & Month Summary Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Navigation Controls (< Month Year > [Today]) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="w-9 h-9 rounded-lg bg-[#141417] hover:bg-[#1a1a20] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-sm"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <h2 className="text-base sm:text-lg font-bold text-white px-2 font-sans tracking-tight select-none">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>

          <button
            onClick={handleNextMonth}
            className="w-9 h-9 rounded-lg bg-[#141417] hover:bg-[#1a1a20] border border-white/[0.08] hover:border-white/[0.16] text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center justify-center shadow-sm"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" strokeWidth={1.75} />
          </button>

          <button
            onClick={handleGoToday}
            className="flex items-center gap-1.5 px-3 h-9 rounded-lg bg-[#141417] hover:bg-[#1a1a20] border border-white/[0.08] hover:border-white/[0.16] text-xs font-semibold text-slate-200 hover:text-white transition-colors cursor-pointer ml-1 shadow-sm"
            title="Jump to Current Month"
          >
            <Calendar className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.75} />
            <span>Today</span>
          </button>

          {selectedDateStr && (
            <button
              onClick={() => onSelectDay(null)}
              className="flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 h-9 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer ml-1"
              title="Clear date filter"
            >
              <span>Selected: <strong>{selectedDateStr}</strong> (Click to reset)</span>
            </button>
          )}
        </div>

        {/* Right: Month Summary Pill (PnL: $4,023.92 | Days: 3) */}
        <div className="flex items-center gap-3 bg-[#141417] border border-white/[0.08] rounded-xl px-4 py-2 shadow-sm">
          <span className="text-xs text-slate-400 font-sans font-medium">PnL:</span>
          <span
            className={`font-bold font-mono text-xs sm:text-sm tabular-nums ${
              monthNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {monthNetPnl < 0 ? '-' : ''}${Math.abs(monthNetPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>

          <div className="h-3.5 w-px bg-white/[0.1]" />

          <span className="text-xs text-slate-400 font-sans font-medium">Days:</span>
          <span className="font-bold font-mono text-xs sm:text-sm text-white">
            {tradingDaysCountThisMonth}
          </span>
        </div>
      </div>

      {/* 2. Main Calendar Workspace (7-Day Grid on Left, Weekly Summary Column on Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Side: 7-Day Calendar Grid (Sun to Sat) */}
        <div className="lg:col-span-9 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="min-w-[580px] space-y-2.5">
            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-2.5 text-center text-xs font-medium text-slate-400 font-sans py-1">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Weeks rows */}
            <div className="space-y-2.5">
              {weeks.map((week) => (
                <div key={week.weekIndex} className="grid grid-cols-7 gap-2.5">
                  {week.days.map((day, dIdx) => {
                    // Empty padding card before or after month bounds
                    if (!day) {
                      return (
                        <div
                          key={`empty-${week.weekIndex}-${dIdx}`}
                          className="rounded-xl bg-[#141418]/40 border border-white/[0.02] min-h-[96px] sm:min-h-[110px]"
                        />
                      );
                    }

                    const hasTrades = day.tradeCount > 0;
                    const isProfit = day.netPnl >= 0;
                    const isSelected = selectedDateStr === day.dateStr;

                    return (
                      <div
                        key={day.dateStr}
                        onClick={() => hasTrades && onSelectDay(isSelected ? null : day.dateStr)}
                        className={`rounded-xl border p-2.5 sm:p-3 flex flex-col justify-between min-h-[96px] sm:min-h-[110px] transition-all relative ${
                          hasTrades
                            ? 'cursor-pointer hover:border-white/[0.18] hover:bg-[#1a1b22]'
                            : 'cursor-default'
                        } ${
                          isSelected
                            ? 'ring-1 ring-blue-500 bg-blue-500/10 border-blue-500/40'
                            : 'bg-[#141418] border-white/[0.05]'
                        }`}
                      >
                        {/* Top-Left: Day Number */}
                        <div>
                          <span
                            className={`text-sm sm:text-base font-sans block leading-none ${
                              hasTrades
                                ? 'text-white font-bold'
                                : 'text-[#52525b] font-medium'
                            }`}
                          >
                            {day.dayNumber}
                          </span>
                        </div>

                        {/* Bottom-Right: Trade count with opposing arrows icon & P&L */}
                        {hasTrades ? (
                          <div className="flex flex-col items-end justify-end mt-auto text-right space-y-0.5">
                            {/* Trade count with opposing arrows */}
                            <div className="flex items-center gap-1 text-slate-300 font-mono text-xs sm:text-[13px] font-medium leading-none">
                              <span>{day.tradeCount}</span>
                              <span className="text-[12px] text-slate-400">⇆</span>
                            </div>

                            {/* P&L amount */}
                            <div
                              className={`font-mono font-bold text-xs sm:text-[13px] tracking-tight tabular-nums leading-tight ${
                                isProfit ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {day.netPnl < 0 ? '-' : ''}${Math.abs(day.netPnl).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Weekly Summary Column */}
        <div className="lg:col-span-3 space-y-2.5">
          {/* Header */}
          <div className="text-xs sm:text-sm font-medium text-slate-400 font-sans py-1">
            Weekly Summary
          </div>

          {/* List of Week Cards */}
          <div className="space-y-2.5">
            {weeks.map((week) => (
              <div
                key={week.weekIndex}
                className="bg-[#141418] border border-white/[0.05] rounded-xl p-3.5 sm:p-4 min-h-[96px] sm:min-h-[110px] flex flex-col justify-between"
              >
                {/* Top Row: Week Name (Bold White) + Date Range (Muted) */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white font-sans tracking-tight">
                    {week.weekName}
                  </span>
                  <span className="text-xs text-slate-400 font-sans">
                    {week.dateRangeLabel}
                  </span>
                </div>

                {/* Bottom Row: Content (No trades OR PnL & Days) */}
                {week.totalTrades === 0 ? (
                  <div className="text-xs text-slate-500 font-sans mt-3">
                    No trades
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-400 font-sans font-medium text-xs">PnL:</span>
                      <span
                        className={`font-bold font-mono text-xs sm:text-sm tabular-nums ${
                          week.totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {week.totalNetPnl < 0 ? '-' : ''}${Math.abs(week.totalNetPnl).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-400 font-sans font-medium text-xs">Days:</span>
                      <span className="font-bold font-mono text-xs sm:text-sm text-white">
                        {week.tradingDaysCount}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
