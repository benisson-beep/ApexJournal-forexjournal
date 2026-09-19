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
      <div className="bg-[#18181E] border border-white/[0.08] rounded-lg w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/[0.06] flex items-center justify-between bg-[#131317]">
          <div>
            <h3 className="font-semibold text-zinc-100 text-sm tracking-tight font-heading">
              Log Manual Trade Execution
            </h3>
            <p className="text-[11px] text-zinc-400">Add an executed trade to your journal</p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Symbol & Direction Toggle */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Instrument
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="e.g. EURUSD, XAUUSD, NAS100..."
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-2 text-xs font-mono font-bold text-zinc-100 uppercase outline-none focus:border-blue-500/50 placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Direction
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#0D0D0F] p-1 rounded-md border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setDirection('BUY')}
                  className={`py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    direction === 'BUY'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  BUY / LONG
                </button>
                <button
                  type="button"
                  onClick={() => setDirection('SELL')}
                  className={`py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                    direction === 'SELL'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
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
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
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
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-2 text-xs font-mono tabular-nums text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
                Session
              </label>
              <select
                value={session}
                onChange={(e) => setSession(e.target.value as SessionType)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-2 text-xs text-zinc-200 outline-none focus:border-blue-500/50 cursor-pointer"
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
              <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Open Price
              </label>
              <input
                type="number"
                step="any"
                value={openPrice}
                onChange={(e) => setOpenPrice(e.target.value)}
                placeholder="e.g. 1.08420"
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Close Price
              </label>
              <input
                type="number"
                step="any"
                value={closePrice}
                onChange={(e) => setClosePrice(e.target.value)}
                placeholder="e.g. 1.08940"
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-rose-400/90 uppercase tracking-wider mb-1">
                Stop Loss
              </label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-200 outline-none focus:border-rose-500/50 placeholder:text-zinc-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-medium text-emerald-400/90 uppercase tracking-wider mb-1">
                Take Profit
              </label>
              <input
                type="number"
                step="any"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                placeholder="Optional"
                className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs font-mono tabular-nums text-zinc-200 outline-none focus:border-emerald-500/50 placeholder:text-zinc-500"
              />
            </div>
          </div>

          {/* Live Calculated Stats Strip */}
          <div className="bg-[#131317] border border-white/[0.06] p-3 rounded-md flex items-center justify-around text-xs font-mono tabular-nums">
            <div>
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Pips</span>
              <span className={`font-semibold ${pips >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pips !== 0 ? (pips >= 0 ? `+${pips}` : pips) : '—'}
              </span>
            </div>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Realized R:R</span>
              <span className="font-semibold text-zinc-200">
                {rMultiple !== undefined ? `${rMultiple > 0 ? '+' : ''}${rMultiple}R` : '—'}
              </span>
            </div>
            <div className="h-6 w-px bg-white/[0.08]" />
            <div>
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Net P&L ($)</span>
              <input
                type="number"
                step="any"
                value={netPnl}
                onChange={(e) => setNetPnl(e.target.value)}
                placeholder="0.00"
                className={`w-24 bg-transparent font-semibold text-xs border-b border-white/20 outline-none text-right tabular-nums ${
                  numNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              />
            </div>
          </div>

          {/* Tags Selector (Setups & Psychology Mistakes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Setup & Psychology Tags
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Click to toggle</span>
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
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 font-medium'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium'
                        : 'bg-[#0D0D0F] text-zinc-400 border border-white/[0.08] hover:border-white/25 hover:text-zinc-200'
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
                  className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-blue-500/50 placeholder:text-zinc-500"
                />
              </div>

              <select
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value as 'SETUP' | 'MISTAKE' | 'CUSTOM')}
                className="bg-[#0D0D0F] border border-white/[0.08] rounded-md px-2.5 py-1.5 text-xs text-zinc-300 outline-none cursor-pointer"
              >
                <option value="SETUP">Setup</option>
                <option value="MISTAKE">Mistake</option>
                <option value="CUSTOM">General</option>
              </select>

              <button
                type="button"
                onClick={() => handleAddCustomTag()}
                className="flex items-center gap-1 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Add Tag</span>
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1.5">
              Execution Notes / Trade Retrospective
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you take this entry? Did you follow your trading rules?"
              className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md p-2.5 text-xs text-zinc-200 outline-none focus:border-blue-500/50 resize-none placeholder-zinc-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04] rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md transition-colors cursor-pointer"
            >
              Save to Journal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
