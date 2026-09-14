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
  const [symbol, setSymbol] = useState('');
  const [direction, setDirection] = useState<Direction>('BUY');
  const [lotSize, setLotSize] = useState<string>('');
  const [openPrice, setOpenPrice] = useState<string>('');
  const [closePrice, setClosePrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [netPnl, setNetPnl] = useState<string>('');
  const [session, setSession] = useState<SessionType>('London');
  const [selectedTags, setSelectedTags] = useState<TradeTag[]>([]);
  const [customTags, setCustomTags] = useState<{ name: string; type: 'SETUP' | 'MISTAKE' | 'CUSTOM' }[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [newTagType, setNewTagType] = useState<'SETUP' | 'MISTAKE' | 'CUSTOM'>('SETUP');
  const [notes, setNotes] = useState('');

  const numLotSize = parseFloat(lotSize) || 0;
  const numOpenPrice = parseFloat(openPrice) || 0;
  const numClosePrice = parseFloat(closePrice) || 0;
  const numStopLoss = stopLoss ? parseFloat(stopLoss) : undefined;
  const numTakeProfit = takeProfit ? parseFloat(takeProfit) : undefined;
  const numNetPnl = parseFloat(netPnl) || 0;

  // Auto-recalculate pips and R-multiple live if prices exist
  const pips =
    symbol && numOpenPrice && numClosePrice
      ? calculatePips(symbol, direction, numOpenPrice, numClosePrice)
      : 0;
  const rMultiple =
    numOpenPrice && numClosePrice && numStopLoss
      ? calculateRMultiple(direction, numOpenPrice, numClosePrice, numStopLoss)
      : undefined;

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

  const handleAddCustomTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTagInput.trim();
    if (!trimmed) return;
    const allExisting = [...COMMON_TAGS, ...customTags];
    if (!allExisting.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setCustomTags((prev) => [...prev, { name: trimmed, type: newTagType }]);
    }
    if (!selectedTags.some((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedTags((prev) => [
        ...prev,
        { id: `tag-${Date.now()}-${Math.random()}`, name: trimmed, type: newTagType },
      ]);
    }
    setNewTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTrade: Trade = {
      id: `tr-${Date.now()}`,
      ticket: String(Math.floor(10000000 + Math.random() * 90000000)),
      accountId,
      symbol: (symbol || 'EURUSD').toUpperCase(),
      direction,
      lotSize: numLotSize || 1.0,
      openPrice: numOpenPrice,
      closePrice: numClosePrice,
      stopLoss: numStopLoss,
      takeProfit: numTakeProfit,
      pips,
      grossPnl: numNetPnl,
      commission: -7 * (numLotSize || 1.0),
      swap: 0,
      netPnl: numNetPnl,
      rMultiple,
      status: numNetPnl > 0 ? 'WIN' : numNetPnl < 0 ? 'LOSS' : 'BE',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-black border border-white/10 rounded-xl w-full max-w-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between bg-[#080c14]">
          <div>
            <h3 className="font-bold text-slate-100 text-sm tracking-tight flex items-center gap-2">
              <span>Log Manual Trade Execution</span>
            </h3>
            <p className="text-[11px] text-slate-400">Add an executed trade to your journal</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-white/5 cursor-pointer"
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
                placeholder="e.g. EURUSD, XAUUSD, NAS100..."
                required
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono font-bold text-slate-100 uppercase outline-none focus:border-emerald-500/50 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#080c14] p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    direction === 'BUY'
                      ? 'bg-emerald-500 text-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
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
                step="any"
                min="0.01"
                value={lotSize}
                onChange={(e) => setLotSize(e.target.value)}
                placeholder="e.g. 1.0"
                required
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as SessionType)}
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-emerald-500/50 cursor-pointer"
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
                onChange={(e) => setOpenPrice(e.target.value)}
                placeholder="e.g. 1.08420"
                required
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
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
                onChange={(e) => setClosePrice(e.target.value)}
                placeholder="e.g. 1.08940"
                required
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
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
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-rose-500/50 placeholder:text-slate-500"
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
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#080c14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Live Calculated Stats Strip */}
          <div className="bg-[#080c14] border border-white/10 p-3 rounded-lg flex items-center justify-around text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Pips</span>
              <span className={`font-bold ${pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pips !== 0 ? (pips >= 0 ? `+${pips}` : pips) : '—'}
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Realized R:R</span>
              <span className="font-bold text-slate-200">
                {rMultiple !== undefined ? `${rMultiple > 0 ? '+' : ''}${rMultiple}R` : '—'}
              </span>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div>
              <span className="text-[10px] text-slate-400 block font-sans uppercase">Net P&L ($)</span>
              <input
                type="number"
                step="any"
                value={netPnl}
                onChange={(e) => setNetPnl(e.target.value)}
                placeholder="0.00"
                className={`w-24 bg-transparent font-bold text-xs border-b border-white/20 outline-none text-right ${
                  numNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>
          </div>

          {/* Tags Selector (Setups & Psychology Mistakes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Setup & Psychology Tags
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Click to toggle</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[...COMMON_TAGS, ...customTags].map((tag) => {
                const isSelected = selectedTags.some((t) => t.name === tag.name);
                return (
                  <button
                    key={tag.name}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? tag.type === 'MISTAKE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                        : 'bg-[#080c14] text-slate-400 border border-white/10 hover:border-white/25 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    {tag.name}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Creator Input */}
            <div className="flex items-center gap-2 pt-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                  placeholder="Add custom tag (e.g. Fair Value Gap, Revenge Entry)..."
                  className="w-full bg-[#080c14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50 placeholder:text-slate-500"
                />
              </div>

              <select
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value as 'SETUP' | 'MISTAKE' | 'CUSTOM')}
                className="bg-[#080c14] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none cursor-pointer"
              >
                <option value="SETUP">Setup</option>
                <option value="MISTAKE">Mistake</option>
                <option value="CUSTOM">General</option>
              </select>

              <button
                type="button"
                onClick={() => handleAddCustomTag()}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tag</span>
              </button>
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
              className="w-full bg-[#080c14] border border-white/10 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500/50 resize-none placeholder-slate-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black rounded-lg transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              Save to Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
