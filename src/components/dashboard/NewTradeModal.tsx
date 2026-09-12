'use client';

import React, { useState, useEffect } from 'react';
import { Direction, SessionType, Trade, TradeTag } from '../../types/trade';
import { calculatePips, calculateRMultiple } from '../../lib/forex-math';
import { AlertCircle, Check, Plus, Tag, X } from 'lucide-react';

interface NewTradeModalProps {
  isOpen: boolean;
  accountId: string;
  onClose: () => void;
  onSaveTrade: (trade: Trade) => void;
}

const COMMON_TAGS: { name: string; type: 'SETUP' | 'MISTAKE' | 'CUSTOM' }[] = [
  { name: 'Liquidity Sweep', type: 'SETUP' },
  { name: 'Silver Bullet', type: 'SETUP' },
  { name: 'Order Block Retest', type: 'SETUP' },
  { name: 'Break & Retest', type: 'SETUP' },
  { name: 'FOMO Entry', type: 'MISTAKE' },
  { name: 'Chased Momentum', type: 'MISTAKE' },
  { name: 'Moved Stop Loss', type: 'MISTAKE' },
  { name: 'Overleveraged', type: 'MISTAKE' },
];

export const NewTradeModal: React.FC<NewTradeModalProps> = ({
  isOpen,
  accountId,
  onClose,
  onSaveTrade,
}) => {
  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState<Direction>('BUY');
  const [lotSize, setLotSize] = useState<number>(1.0);
  const [openPrice, setOpenPrice] = useState<number>(1.08500);
  const [closePrice, setClosePrice] = useState<number>(1.08850);
  const [stopLoss, setStopLoss] = useState<number>(1.08300);
  const [takeProfit, setTakeProfit] = useState<number>(1.09000);
  const [netPnl, setNetPnl] = useState<number>(350);
  const [session, setSession] = useState<SessionType>('London');
  const [selectedTags, setSelectedTags] = useState<TradeTag[]>([]);
  const [notes, setNotes] = useState('');

  // Auto-recalculate pips and R-multiple live
  const pips = calculatePips(symbol, direction, openPrice, closePrice);
  const rMultiple = calculateRMultiple(direction, openPrice, closePrice, stopLoss);

  if (!isOpen) return null;

  const toggleTag = (tagTemplate: { name: string; type: 'SETUP' | 'MISTAKE' | 'CUSTOM' }) => {
    if (selectedTags.some((t) => t.name === tagTemplate.name)) {
      setSelectedTags(selectedTags.filter((t) => t.name !== tagTemplate.name));
    } else {
      setSelectedTags([
        ...selectedTags,
        { id: `tag-${Date.now()}-${Math.random()}`, name: tagTemplate.name, type: tagTemplate.type },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrade: Trade = {
      id: `tr-${Date.now()}`,
      ticket: String(Math.floor(10000000 + Math.random() * 90000000)),
      accountId,
      symbol: symbol.toUpperCase(),
      direction,
      lotSize,
      openPrice,
      closePrice,
      stopLoss: stopLoss || undefined,
      takeProfit: takeProfit || undefined,
      pips,
      grossPnl: netPnl,
      commission: -7 * lotSize,
      swap: 0,
      netPnl,
      rMultiple,
      status: netPnl > 0 ? 'WIN' : netPnl < 0 ? 'LOSS' : 'BE',
      openTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      closeTime: new Date().toISOString(),
      session,
      tags: selectedTags,
      notes,
    };

    onSaveTrade(newTrade);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#1b2336] flex items-center justify-between bg-[#0a0d14]/60">
          <div>
            <h3 className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2">
              <span>Log Manual Trade Execution</span>
            </h3>
            <p className="text-[11px] text-slate-400">Add an executed trade to your journal</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-[#1b2336]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Symbol & Direction Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Instrument
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="EURUSD, XAUUSD..."
                required
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-200 uppercase outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#131929] p-1 rounded-lg border border-[#1b2336]">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-1 text-xs font-bold rounded transition-colors ${
                    direction === 'BUY'
                      ? 'bg-emerald-500 text-[#080b11]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-1 text-xs font-bold rounded transition-colors ${
                    direction === 'SELL'
                      ? 'bg-rose-500 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  SELL / SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Lots & Session */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Volume (Lots)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as SessionType)}
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
                <option value="Asian">Asian Session</option>
                <option value="Overlap">London / NY Overlap</option>
              </select>
            </div>
          </div>

          {/* Price Entries: Open, Close, Stop Loss, Take Profit */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Open Price
              </label>
              <input
                type="number"
                step="any"
                value={openPrice}
                onChange={(e) => setOpenPrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Close Price
              </label>
              <input
                type="number"
                step="any"
                value={closePrice}
                onChange={(e) => setClosePrice(parseFloat(e.target.value) || 0)}
                required
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-rose-400/90 uppercase tracking-wider mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-rose-500/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-emerald-400/90 uppercase tracking-wider mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#131929] border border-[#1b2336] rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Live Calculated Stats Strip */}
          <div className="bg-[#131929] border border-[#1b2336] p-3 rounded-xl flex items-center justify-around text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Pips</span>
              <span className={`font-bold ${pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pips >= 0 ? `+${pips}` : pips}
              </span>
            </div>
            <div className="h-6 w-px bg-[#1b2336]" />
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Realized R:R</span>
              <span className="font-bold text-slate-200">
                {rMultiple !== undefined ? `${rMultiple > 0 ? '+' : ''}${rMultiple}R` : '—'}
              </span>
            </div>
            <div className="h-6 w-px bg-[#1b2336]" />
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Net P&L ($)</span>
              <input
                type="number"
                step="any"
                value={netPnl}
                onChange={(e) => setNetPnl(parseFloat(e.target.value) || 0)}
                className={`w-24 bg-transparent font-bold text-xs border-b border-[#1b2336] outline-none text-right ${
                  netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>
          </div>

          {/* Tags Selector (Setups & Psychology Mistakes) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Setup & Psychology Tags
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_TAGS.map((tag) => {
                const isSelected = selectedTags.some((t) => t.name === tag.name);
                return (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? tag.type === 'MISTAKE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-[#131929] text-slate-400 border border-[#1b2336] hover:border-slate-600'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Execution Notes / Trade Retrospective
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you take this entry? Did you follow your trading rules?"
              className="w-full bg-[#131929] border border-[#1b2336] rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50 resize-none placeholder-slate-400"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1b2336]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-[#131929] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] rounded-lg transition-all shadow-lg shadow-emerald-500/20"
            >
              Save to Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
