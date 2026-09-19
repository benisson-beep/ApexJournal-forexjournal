'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, ExternalLink, Play, Radio, Shield, Terminal, X, Zap } from 'lucide-react';
import { Trade } from '../../types/trade';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTradeSynced: (trade: Trade) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  isOpen,
  onClose,
  onTradeSynced,
}) => {
  const [apiKey] = useState('aj_live_9a87d620bf41e');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedMessage, setSimulatedMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const webhookUrl = typeof window !== 'undefined' ? `${window.location.origin}/api/sync/trade` : 'http://localhost:3000/api/sync/trade';

  const copyToClipboard = (text: string, isKey: boolean) => {
    navigator.clipboard.writeText(text);
    if (isKey) {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleSimulateTrade = async () => {
    setIsSimulating(true);
    setSimulatedMessage(null);

    const randomTicket = Math.floor(70000000 + Math.random() * 20000000);
    const mockTrades = [
      { symbol: 'EURUSD', type: 'BUY', lots: 3.0, open: 1.08620, close: 1.09140, sl: 1.08420, tp: 1.09300, profit: 1560.00, comment: 'London Breakout' },
      { symbol: 'XAUUSD', type: 'SELL', lots: 2.0, open: 2520.50, close: 2505.00, sl: 2528.00, tp: 2495.00, profit: 3100.00, comment: 'NY Liquidity Sweep' },
      { symbol: 'GBPJPY', type: 'BUY', lots: 2.5, open: 191.200, close: 191.950, sl: 190.800, tp: 192.500, profit: 1225.00, comment: 'Tokyo Range Retest' },
      { symbol: 'NAS100', type: 'SELL', lots: 4.0, open: 19850.0, close: 19770.0, sl: 19890.0, tp: 19700.0, profit: 1600.00, comment: 'Silver Bullet' },
    ];

    const pick = mockTrades[Math.floor(Math.random() * mockTrades.length)];

    try {
      const res = await fetch('/api/sync/trade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          ticket: randomTicket,
          account_id: 'acc-ftmo-1',
          symbol: pick.symbol,
          type: pick.type,
          lots: pick.lots,
          open_price: pick.open,
          close_price: pick.close,
          sl: pick.sl,
          tp: pick.tp,
          commission: -15.00,
          swap: 0,
          profit: pick.profit,
          comment: pick.comment,
        }),
      });

      const data = await res.json();
      if (data.success && data.trade) {
        onTradeSynced(data.trade);
        setSimulatedMessage(`✓ Deal #${randomTicket} (${pick.symbol} +$${pick.profit.toFixed(2)}) synced live!`);
      }
    } catch (err) {
      console.error('Simulation error:', err);
      setSimulatedMessage('Error simulating webhook.');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#18181E] border border-white/[0.08] rounded-lg w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-white/[0.06] flex items-center justify-between bg-[#131317]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-zinc-300">
              <Zap className="w-4 h-4" strokeWidth={1.5} />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm tracking-tight font-heading">
                MetaTrader 4 / 5 Real-Time Auto-Sync
              </h3>
              <p className="text-[11px] text-zinc-400">
                Stream trades directly from your MT4/MT5 desktop terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Credentials Card */}
          <div className="bg-[#131317] border border-white/[0.06] rounded-md p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Your Secret API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-1.5 text-xs font-mono text-zinc-300 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(apiKey, true)}
                  className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 p-2 rounded-md text-xs transition-colors flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
                Webhook Endpoint URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-1.5 text-xs font-mono text-zinc-300 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrl, false)}
                  className="bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 p-2 rounded-md text-xs transition-colors flex items-center gap-1 shrink-0 font-medium cursor-pointer"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Download EA Files */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-2">
              Download Sync Expert Advisors (EAs)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/downloads/ApexJournalSync.mq5"
                download="ApexJournalSync.mq5"
                className="flex items-center justify-between p-3 rounded-md bg-[#131317] border border-white/[0.07] hover:border-white/[0.15] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
                      MetaTrader 5 EA
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">ApexJournalSync.mq5</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" strokeWidth={1.5} />
              </a>

              <a
                href="/downloads/ApexJournalSync.mq4"
                download="ApexJournalSync.mq4"
                className="flex items-center justify-between p-3 rounded-md bg-[#131317] border border-white/[0.07] hover:border-white/[0.15] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-medium text-zinc-200 block group-hover:text-white transition-colors">
                      MetaTrader 4 EA
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">ApexJournalSync.mq4</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider block font-heading">
              Terminal Setup Guide
            </span>
            <div className="text-xs text-zinc-300 space-y-2 bg-[#0D0D0F]/60 border border-white/[0.06] rounded-md p-3.5 leading-relaxed font-sans">
              <p className="flex items-start gap-2">
                <strong className="text-zinc-400 font-mono">1.</strong>
                <span>Open MT4/MT5 $\rightarrow$ <strong>File</strong> $\rightarrow$ <strong>Open Data Folder</strong> $\rightarrow$ drop the EA inside <code>MQL5/Experts</code> (or <code>MQL4/Experts</code>).</span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-zinc-400 font-mono">2.</strong>
                <span>In MT4/MT5: Go to <strong>Tools $\rightarrow$ Options $\rightarrow$ Expert Advisors</strong>. Check <strong>"Allow WebRequest for listed URL"</strong> and add: <code className="text-zinc-300 bg-white/[0.05] px-1.5 py-0.5 rounded font-mono">{webhookUrl}</code></span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-zinc-400 font-mono">3.</strong>
                <span>Drag the EA onto any chart, paste your <strong>API Key</strong> in the Inputs tab, and click OK. Any closed trade will stream live into your journal!</span>
              </p>
            </div>
          </div>

          {/* Test Simulator Section */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">Want to test right now?</span>
              <span className="text-[11px] text-zinc-400">Simulate a live deal execution from MetaTrader</span>
            </div>

            <button
              onClick={handleSimulateTrade}
              disabled={isSimulating}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white px-3.5 py-2 rounded-md text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" strokeWidth={1.5} />
              <span>{isSimulating ? 'Sending Deal...' : 'Simulate MT5 Trade'}</span>
            </button>
          </div>

          {simulatedMessage && (
            <div className="p-2.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-zinc-300 text-xs font-mono text-center">
              {simulatedMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
