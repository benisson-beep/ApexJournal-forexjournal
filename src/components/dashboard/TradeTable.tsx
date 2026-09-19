'use client';

import React, { useState } from 'react';
import { Trade, Direction, SessionType } from '../../types/trade';
import { ArrowDownLeft, ArrowUpRight, Clock, Filter, Search, Tag, Trash2, X } from 'lucide-react';

interface TradeTableProps {
  trades: Trade[];
  onDeleteTrade: (id: string) => void;
}

export const TradeTable: React.FC<TradeTableProps> = ({ trades, onDeleteTrade }) => {
  const [search, setSearch] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedDirection, setSelectedDirection] = useState<string>('ALL');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('ALL');

  const uniqueSymbols = Array.from(new Set(trades.map((t) => t.symbol.toUpperCase()))).sort();

  const filteredTrades = trades.filter((trade) => {
    // Search filter
    const matchesSearch =
      trade.symbol.toLowerCase().includes(search.toLowerCase()) ||
      trade.ticket.includes(search) ||
      trade.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase())) ||
      (trade.notes && trade.notes.toLowerCase().includes(search.toLowerCase()));

    // Symbol filter
    const matchesSymbol = selectedSymbol === 'ALL' || trade.symbol.toUpperCase() === selectedSymbol;

    // Session filter
    const matchesSession = selectedSession === 'ALL' || trade.session === selectedSession;

    // Direction filter
    const matchesDirection = selectedDirection === 'ALL' || trade.direction === selectedDirection;

    // Outcome filter
    const matchesOutcome =
      selectedOutcome === 'ALL' ||
      (selectedOutcome === 'WIN' && trade.netPnl > 0) ||
      (selectedOutcome === 'LOSS' && trade.netPnl < 0);

    return matchesSearch && matchesSymbol && matchesSession && matchesDirection && matchesOutcome;
  });

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="bg-[#131317] border border-white/[0.07] rounded-lg overflow-hidden">
      {/* Table Controls & Filter Bar */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#18181E]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-sm sm:text-base font-heading font-semibold text-white tracking-tight">
            Trade Execution Log
          </h2>
          <span className="text-xs font-mono text-slate-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded">
            {filteredTrades.length} {filteredTrades.length === 1 ? 'deal' : 'deals'}
          </span>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative min-w-[170px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search symbol, tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#131317] border border-white/[0.06] focus:border-blue-500/50 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 transition-colors outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3 h-3" strokeWidth={1.5} />
              </button>
            )}
          </div>

          {/* Symbol Filter */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-[#131317] border border-white/[0.06] text-xs font-medium text-slate-200 rounded-md px-2.5 py-1 outline-none cursor-pointer hover:border-white/[0.12]"
          >
            <option value="ALL">All Symbols</option>
            {uniqueSymbols.map((sym) => (
              <option key={sym} value={sym}>
                {sym}
              </option>
            ))}
          </select>

          {/* Session Selector */}
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="bg-[#131317] border border-white/[0.06] text-xs font-medium text-slate-300 rounded-md px-2.5 py-1 outline-none cursor-pointer hover:border-white/[0.12]"
          >
            <option value="ALL">All Sessions</option>
            <option value="London">London</option>
            <option value="New York">New York</option>
            <option value="Asian">Asian</option>
          </select>

          {/* Direction Filter */}
          <select
            value={selectedDirection}
            onChange={(e) => setSelectedDirection(e.target.value)}
            className="bg-[#131317] border border-white/[0.06] text-xs font-medium text-slate-300 rounded-md px-2.5 py-1 outline-none cursor-pointer hover:border-white/[0.12]"
          >
            <option value="ALL">All Types</option>
            <option value="BUY">BUY Only</option>
            <option value="SELL">SELL Only</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={selectedOutcome}
            onChange={(e) => setSelectedOutcome(e.target.value)}
            className="bg-[#131317] border border-white/[0.06] text-xs font-medium text-slate-300 rounded-md px-2.5 py-1 outline-none cursor-pointer hover:border-white/[0.12]"
          >
            <option value="ALL">All Outcomes</option>
            <option value="WIN">Winners</option>
            <option value="LOSS">Losses</option>
          </select>
        </div>
      </div>

      {/* High-Density Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] bg-[#18181E] text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              <th className="py-2.5 px-4">Date / Time</th>
              <th className="py-2.5 px-3">Symbol & Type</th>
              <th className="py-2.5 px-3 text-right">Lots</th>
              <th className="py-2.5 px-3 text-right">Entry / Exit</th>
              <th className="py-2.5 px-3 text-right">SL / TP</th>
              <th className="py-2.5 px-3 text-right">Pips</th>
              <th className="py-2.5 px-3 text-right">Net P&L</th>
              <th className="py-2.5 px-3 text-right">Realized R:R</th>
              <th className="py-2.5 px-3">Session</th>
              <th className="py-2.5 px-3">Tags & Setup</th>
              <th className="py-2.5 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filteredTrades.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Filter className="w-7 h-7 text-slate-600" strokeWidth={1.5} />
                    <p className="text-xs font-medium text-slate-300">No trades match your filters</p>
                    <p className="text-[11px] text-slate-500">Try clearing filters or search criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTrades.map((trade) => {
                const isWin = trade.netPnl > 0;
                const isLoss = trade.netPnl < 0;

                return (
                  <tr
                    key={trade.id}
                    className="hover:bg-white/[0.02] transition-colors group"
                  >
                    {/* Date / Time */}
                    <td className="py-2.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      <span>{formatDate(trade.closeTime)}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        #{trade.ticket}
                      </span>
                    </td>

                    {/* Symbol & Direction */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-200 tracking-tight text-xs">
                          {trade.symbol}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded uppercase ${
                            trade.direction === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </div>
                    </td>

                    {/* Lots */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300 whitespace-nowrap">
                      {trade.lotSize.toFixed(2)}
                    </td>

                    {/* Entry / Exit */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <div className="text-slate-200">{trade.openPrice}</div>
                      <div className="text-[10px] text-slate-500">{trade.closePrice}</div>
                    </td>

                    {/* SL / TP */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[11px] whitespace-nowrap">
                      <div className="text-rose-400/80">{trade.stopLoss ?? '—'}</div>
                      <div className="text-emerald-400/80">{trade.takeProfit ?? '—'}</div>
                    </td>

                    {/* Pips */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span className={trade.pips > 0 ? 'text-emerald-400' : trade.pips < 0 ? 'text-rose-400' : 'text-slate-400'}>
                        {trade.pips > 0 ? `+${trade.pips}` : trade.pips}
                      </span>
                    </td>

                    {/* Net P&L */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      <span
                        className={`font-mono font-medium text-xs px-2 py-0.5 rounded ${
                          isWin
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : isLoss
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'text-slate-400'
                        }`}
                      >
                        {isWin ? '+' : ''}${trade.netPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Realized R:R */}
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums whitespace-nowrap">
                      {trade.rMultiple !== undefined ? (
                        <span
                          className={`font-mono text-xs ${
                            trade.rMultiple > 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {trade.rMultiple > 0 ? `+${trade.rMultiple}R` : `${trade.rMultiple}R`}
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    {/* Session */}
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[10px] font-mono text-slate-400 bg-white/[0.03] border border-white/[0.06] px-1.5 py-0.5 rounded">
                        {trade.session}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {trade.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium flex items-center gap-1 ${
                              tag.type === 'MISTAKE'
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/25'
                                : tag.type === 'SETUP'
                                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/25'
                                : 'bg-white/[0.04] text-slate-300 border border-white/[0.06]'
                            }`}
                          >
                            <Tag className="w-2.5 h-2.5" strokeWidth={1.5} />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onDeleteTrade(trade.id)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Delete trade"
                      >
                        <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
