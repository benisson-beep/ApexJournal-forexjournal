'use client';

import React, { useState, useMemo, useRef } from 'react';
import { Trade, TradingAccount } from '../../types/trade';

interface EquityCurveProps {
  account?: TradingAccount | null;
  trades: Trade[];
  selectedDateStr?: string | null;
}

type TimeRange = '1W' | '1M' | '3M' | 'ALL';

interface EquityPoint {
  id: string;
  date: Date;
  dateLabel: string;
  equity: number;
  change: number;
  symbol?: string;
  lotSize?: number;
  direction?: string;
}

export const EquityCurve: React.FC<EquityCurveProps> = ({
  account,
  trades,
  selectedDateStr,
}) => {
  const [range, setRange] = useState<TimeRange>('ALL');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Sort all account trades chronologically
  const sortedTrades = useMemo(() => {
    return [...trades].sort(
      (a, b) => new Date(a.closeTime).getTime() - new Date(b.closeTime).getTime()
    );
  }, [trades]);

  // 2. Determine reference time and cutoff based on selected range
  const { visibleTrades, startEquity } = useMemo(() => {
    const initialBalance = account?.initialBalance || 0;
    if (sortedTrades.length === 0) {
      return { visibleTrades: [], startEquity: initialBalance };
    }

    if (range === 'ALL') {
      return { visibleTrades: sortedTrades, startEquity: initialBalance };
    }

    const now = Date.now();
    const latestTradeTime = new Date(sortedTrades[sortedTrades.length - 1].closeTime).getTime();
    // If the latest trade is older than 90 days from now, anchor the window to latestTradeTime
    const refTime = now - latestTradeTime > 90 * 86400000 ? latestTradeTime : now;

    let durationDays = 7;
    if (range === '1W') durationDays = 7;
    else if (range === '1M') durationDays = 30;
    else if (range === '3M') durationDays = 90;

    const cutoffTime = refTime - durationDays * 86400000;

    const tradesBefore = sortedTrades.filter(
      (t) => new Date(t.closeTime).getTime() < cutoffTime
    );
    const priorPnl = tradesBefore.reduce((sum, t) => sum + t.netPnl, 0);
    const calculatedStartEquity = Number((initialBalance + priorPnl).toFixed(2));

    const inRangeTrades = sortedTrades.filter(
      (t) => new Date(t.closeTime).getTime() >= cutoffTime
    );

    return {
      visibleTrades: inRangeTrades,
      startEquity: calculatedStartEquity,
    };
  }, [sortedTrades, range, account?.initialBalance]);

  // 3. Build data points for the equity curve
  const points: EquityPoint[] = useMemo(() => {
    const initialBalance = account?.initialBalance || 0;

    if (visibleTrades.length === 0) {
      const now = new Date();
      const past = new Date(now.getTime() - 7 * 86400000);
      return [
        {
          id: 'start',
          date: past,
          dateLabel: past.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          equity: startEquity || initialBalance,
          change: 0,
        },
        {
          id: 'current',
          date: now,
          dateLabel: now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          equity: startEquity || initialBalance,
          change: 0,
        },
      ];
    }

    const result: EquityPoint[] = [];
    const firstTrade = visibleTrades[0];
    const firstTradeDate = new Date(firstTrade.closeTime);
    const startDate = new Date(firstTradeDate.getTime() - 3600000);

    // Initial baseline point
    result.push({
      id: 'start-point',
      date: startDate,
      dateLabel: startDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      equity: startEquity,
      change: 0,
    });

    let runningEquity = startEquity;
    visibleTrades.forEach((t, idx) => {
      runningEquity += t.netPnl;
      const d = new Date(t.closeTime);
      result.push({
        id: t.id || `trade-${idx}`,
        date: d,
        dateLabel: d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        equity: Number(runningEquity.toFixed(2)),
        change: t.netPnl,
        symbol: t.symbol,
        lotSize: t.lotSize,
        direction: t.direction,
      });
    });

    return result;
  }, [visibleTrades, startEquity, account?.initialBalance]);

  // Current equity & net stats for header
  const currentEquity = points[points.length - 1].equity;
  const initialEquity = account?.initialBalance || points[0].equity;
  const totalChange = currentEquity - initialEquity;
  const changePercentage = initialEquity > 0 ? (totalChange / initialEquity) * 100 : 0;
  const isNetPositive = totalChange >= 0;

  // 4. SVG Chart Coordinates & Scaling
  const width = 1000;
  const height = 300;
  const paddingLeft = 70;
  const paddingRight = 24;
  const paddingTop = 20;
  const paddingBottom = 38;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const equities = points.map((p) => p.equity);
  const minEquity = Math.min(...equities);
  const maxEquity = Math.max(...equities);
  const rawDiff = maxEquity - minEquity;

  const buffer = rawDiff > 0 ? rawDiff * 0.15 : (minEquity > 0 ? minEquity * 0.05 : 1000);
  const yMin = minEquity - buffer;
  const yMax = maxEquity + buffer;
  const yRange = yMax - yMin || 1;

  const getY = (val: number) => {
    return paddingTop + chartHeight - ((val - yMin) / yRange) * chartHeight;
  };

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingLeft;
    return paddingLeft + (idx / (points.length - 1)) * chartWidth;
  };

  const coords = useMemo(() => {
    return points.map((p, idx) => ({
      x: getX(idx),
      y: getY(p.equity),
      point: p,
      index: idx,
    }));
  }, [points, yMin, yRange]);

  // Generate SVG Line & Area Paths
  const linePath = useMemo(() => {
    return coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(' ');
  }, [coords]);

  const areaPath = useMemo(() => {
    if (coords.length === 0) return '';
    const lastX = coords[coords.length - 1].x.toFixed(1);
    const firstX = coords[0].x.toFixed(1);
    const bottomY = (paddingTop + chartHeight).toFixed(1);
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [linePath, coords, paddingTop, chartHeight]);

  // Y-axis tick values (4 clean grid intervals)
  const yTicks = useMemo(() => {
    const count = 4;
    return Array.from({ length: count }, (_, i) => {
      const val = yMin + (i / (count - 1)) * (yMax - yMin);
      return {
        val,
        y: getY(val),
      };
    });
  }, [yMin, yMax, yRange]);

  // X-axis tick indices (up to 5 distributed date labels)
  const xTickIndices = useMemo(() => {
    if (coords.length <= 1) return [0];
    if (coords.length <= 5) return coords.map((_, i) => i);
    const step = (coords.length - 1) / 4;
    return [
      0,
      Math.round(step),
      Math.round(step * 2),
      Math.round(step * 3),
      coords.length - 1,
    ];
  }, [coords]);

  // Interactive mouse tracking
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;

    let closestIdx = 0;
    let minDistance = Infinity;

    for (let i = 0; i < coords.length; i++) {
      const dist = Math.abs(coords[i].x - mouseX);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    }

    setHoverIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  const activeCoord = hoverIndex !== null ? coords[hoverIndex] : null;

  return (
    <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5">
      {/* 1. Header with Title, Balance Info, and Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-baseline gap-3">
          <h3 className="text-sm font-heading font-semibold text-slate-100 uppercase tracking-wider">
            Equity
          </h3>
          <span className="text-lg font-bold font-mono text-white tabular-nums">
            ${currentEquity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span
            className={`text-xs font-mono font-medium ${
              isNetPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isNetPositive ? '+' : ''}${totalChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
            ({isNetPositive ? '+' : ''}{changePercentage.toFixed(2)}%)
          </span>
        </div>

        {/* Range Controls: [ 1W ] [ 1M ] [ 3M ] [ ALL ] */}
        <div className="flex items-center gap-1 bg-[#18181E] border border-white/[0.06] p-1 rounded-md self-start sm:self-auto">
          {(['1W', '1M', '3M', 'ALL'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => {
                setRange(r);
                setHoverIndex(null);
              }}
              className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                range === r
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Responsive Chart Container with Tooltip Overlay */}
      <div ref={containerRef} className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines & Y-Axis Labels */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 3.5}
                textAnchor="end"
                className="text-[10px] font-mono fill-slate-500"
              >
                ${Math.round(tick.val).toLocaleString('en-US')}
              </text>
            </g>
          ))}

          {/* Initial Balance Reference Line (if in visible range) */}
          {initialEquity >= yMin && initialEquity <= yMax && (
            <line
              x1={paddingLeft}
              y1={getY(initialEquity)}
              x2={width - paddingRight}
              y2={getY(initialEquity)}
              stroke="rgba(255, 255, 255, 0.12)"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          )}

          {/* Area Fill */}
          <path d={areaPath} fill="url(#equityGradient)" />

          {/* Main Curve Stroke */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* X-Axis Baseline */}
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="1"
          />

          {/* X-Axis Date Labels */}
          {xTickIndices.map((idx, i) => {
            const coord = coords[idx];
            if (!coord) return null;
            const textAnchor =
              i === 0 ? 'start' : i === xTickIndices.length - 1 ? 'end' : 'middle';
            const dateStr = coord.point.date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });
            return (
              <text
                key={idx}
                x={coord.x}
                y={paddingTop + chartHeight + 20}
                textAnchor={textAnchor}
                className="text-[10px] font-mono fill-slate-500"
              >
                {dateStr}
              </text>
            );
          })}

          {/* Active Hover Crosshair & Point Indicator */}
          {activeCoord && (
            <g>
              {/* Vertical Crosshair */}
              <line
                x1={activeCoord.x}
                y1={paddingTop}
                x2={activeCoord.x}
                y2={paddingTop + chartHeight}
                stroke="rgba(255, 255, 255, 0.25)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Horizontal Crosshair */}
              <line
                x1={paddingLeft}
                y1={activeCoord.y}
                x2={width - paddingRight}
                y2={activeCoord.y}
                stroke="rgba(255, 255, 255, 0.15)"
                strokeDasharray="2 2"
                strokeWidth="1"
              />
              {/* Outer Glow Halo */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="6"
                fill="#3b82f6"
                fillOpacity="0.25"
              />
              {/* Core Dot */}
              <circle
                cx={activeCoord.x}
                cy={activeCoord.y}
                r="3.5"
                fill="#3b82f6"
                stroke="#131317"
                strokeWidth="1.5"
              />
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay */}
        {activeCoord && (
          <div
            className="absolute pointer-events-none z-20 bg-[#18181E] border border-white/[0.12] rounded px-3 py-2 shadow-xl text-xs font-mono transition-transform duration-75"
            style={{
              left: `${(activeCoord.x / width) * 100}%`,
              top: `${(activeCoord.y / height) * 100}%`,
              transform: `translate(${activeCoord.x > width * 0.7 ? '-105%' : activeCoord.x < width * 0.3 ? '5%' : '-50%'}, -115%)`,
            }}
          >
            <div className="text-[10px] text-slate-400 mb-0.5">
              {activeCoord.point.dateLabel}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Equity:</span>
              <strong className="text-white text-sm">
                ${activeCoord.point.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            {activeCoord.point.change !== 0 ? (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-slate-400">P&L:</span>
                <span
                  className={
                    activeCoord.point.change > 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'
                  }
                >
                  {activeCoord.point.change > 0 ? '+' : ''}${activeCoord.point.change.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {activeCoord.point.symbol && (
                  <span className="text-[10px] text-slate-400">
                    ({activeCoord.point.symbol} {activeCoord.point.direction})
                  </span>
                )}
              </div>
            ) : (
              <div className="text-[10px] text-slate-500 mt-0.5">
                Baseline Capital
              </div>
            )}
          </div>
        )}

        {/* Empty state hint if zero trades */}
        {visibleTrades.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-xs text-slate-500 bg-[#131317]/80 px-3 py-1.5 rounded border border-white/[0.04]">
              No closed trades recorded in this period.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
