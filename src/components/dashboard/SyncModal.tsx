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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-2xl w-full max-w-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 px-6 border-b border-[#1b2336] flex items-center justify-between bg-[#0a0d14]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm tracking-tight">
                MetaTrader 4 / 5 Real-Time Auto-Sync
              </h3>
              <p className="text-[11px] text-slate-400">
                Stream trades directly from your MT4/MT5 desktop terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#1b2336]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Credentials Card */}
          <div className="bg-[#131929] border border-[#1b2336] rounded-xl p-4 space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Your Secret API Key
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={apiKey}
                  className="w-full bg-[#0e131f] border border-[#1b2336] rounded-lg px-3 py-1.5 text-xs font-mono text-emerald-400 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(apiKey, true)}
                  className="bg-[#1b2336] hover:bg-[#242f48] text-slate-200 p-2 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Webhook Endpoint URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="w-full bg-[#0e131f] border border-[#1b2336] rounded-lg px-3 py-1.5 text-xs font-mono text-slate-300 outline-none"
                />
                <button
                  onClick={() => copyToClipboard(webhookUrl, false)}
                  className="bg-[#1b2336] hover:bg-[#242f48] text-slate-200 p-2 rounded-lg text-xs transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Download EA Files */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Download Sync Expert Advisors (EAs)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/downloads/ApexJournalSync.mq5"
                download="ApexJournalSync.mq5"
                className="flex items-center justify-between p-3 rounded-xl bg-[#131929] border border-[#1b2336] hover:border-emerald-500/40 hover:bg-[#182136] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">
                      MetaTrader 5 EA
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ApexJournalSync.mq5</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </a>

              <a
                href="/downloads/ApexJournalSync.mq4"
                download="ApexJournalSync.mq4"
                className="flex items-center justify-between p-3 rounded-xl bg-[#131929] border border-[#1b2336] hover:border-emerald-500/40 hover:bg-[#182136] transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block group-hover:text-emerald-400 transition-colors">
                      MetaTrader 4 EA
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">ApexJournalSync.mq4</span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-400" />
              </a>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              3-Minute Terminal Setup Guide
            </span>
            <div className="text-xs text-slate-300 space-y-2 bg-[#0a0d14]/50 border border-[#1b2336] rounded-xl p-3.5 leading-relaxed font-sans">
              <p className="flex items-start gap-2">
                <strong className="text-emerald-400 font-mono">1.</strong>
                <span>Open MT4/MT5 $\rightarrow$ <strong>File</strong> $\rightarrow$ <strong>Open Data Folder</strong> $\rightarrow$ drop the EA inside <code>MQL5/Experts</code> (or <code>MQL4/Experts</code>).</span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-emerald-400 font-mono">2.</strong>
                <span>In MT4/MT5: Go to <strong>Tools $\rightarrow$ Options $\rightarrow$ Expert Advisors</strong>. Check <strong>"Allow WebRequest for listed URL"</strong> and add: <code className="text-emerald-400 bg-[#131929] px-1 py-0.5 rounded">{webhookUrl}</code></span>
              </p>
              <p className="flex items-start gap-2">
                <strong className="text-emerald-400 font-mono">3.</strong>
                <span>Drag the EA onto any chart, paste your <strong>API Key</strong> in the Inputs tab, and click OK. Any closed trade will stream live into your journal!</span>
              </p>
            </div>
          </div>

          {/* Test Simulator Section */}
          <div className="pt-2 border-t border-[#1b2336] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-slate-200 block">Want to test right now?</span>
              <span className="text-[11px] text-slate-400">Simulate a live deal execution from MetaTrader</span>
            </div>

            <button
              onClick={handleSimulateTrade}
              disabled={isSimulating}
              className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Sending Deal...' : '⚡ Simulate MT5 Trade'}</span>
            </button>
          </div>

          {simulatedMessage && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono text-center">
              {simulatedMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
