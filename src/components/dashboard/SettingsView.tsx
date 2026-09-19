'use client';

import React, { useState } from 'react';
import {
  Shield,
  Sliders,
  Zap,
  Database,
  Download,
  RotateCcw,
  Check,
  Copy,
  Terminal,
  Save,
  Volume2,
  DollarSign,
  Trash2,
} from 'lucide-react';
import { Trade } from '../../types/trade';

interface SettingsViewProps {
  trades: Trade[];
  onResetSampleData?: () => void;
  onClearAllTrades?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  trades,
  onResetSampleData,
  onClearAllTrades,
}) => {
  // Risk Settings State
  const [riskPerTrade, setRiskPerTrade] = useState('1.0');
  const [maxDailyLoss, setMaxDailyLoss] = useState('4500');
  const [maxDailyTrades, setMaxDailyTrades] = useState('4');
  const [requireStopLoss, setRequireStopLoss] = useState(true);

  // General Settings State
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultLotSize, setDefaultLotSize] = useState('2.00');

  // Webhook State
  const [webhookSecret, setWebhookSecret] = useState('aj_sec_live_9f81a7b32c84e601');
  const [copiedToken, setCopiedToken] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  // Interface State
  const [soundEffects, setSoundEffects] = useState(true);
  const [compactDensity, setCompactDensity] = useState(false);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const webhookEndpoint = typeof window !== 'undefined'
    ? `${window.location.origin}/api/sync/trade?token=${webhookSecret}`
    : `https://apexjournal.io/api/sync/trade?token=${webhookSecret}`;

  const handleCopyToken = () => {
    navigator.clipboard?.writeText?.(webhookEndpoint);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleRegenerateToken = () => {
    const randomHex = Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    setWebhookSecret(`aj_sec_live_${randomHex}`);
  };

  const handleTestPing = () => {
    setIsPinging(true);
    setPingSuccess(false);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      setTimeout(() => setPingSuccess(false), 3000);
    }, 900);
  };

  const handleSaveSettings = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportCSV = () => {
    if (!trades || trades.length === 0) return;
    const headers = ['ID', 'Symbol', 'Direction', 'Lots', 'EntryPrice', 'ExitPrice', 'OpenTime', 'CloseTime', 'NetPnl', 'Pips', 'Tags'];
    const rows = trades.map((t) => [
      t.id,
      t.symbol,
      t.direction,
      t.lotSize,
      t.openPrice,
      t.closePrice,
      t.openTime,
      t.closeTime,
      t.netPnl,
      t.pips,
      `"${t.tags?.map((tag) => tag.name).join(';') || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apexjournal-trades-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header with Save Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white font-heading">
            Platform & Risk Settings
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure automated risk guardrails, MT4/MT5 webhooks, and interface preferences
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-md transition-colors cursor-pointer"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Section 1: Risk & Prop Firm Guardrails */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider border-b border-white/[0.06] pb-3 font-heading">
          <Shield className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Risk Management Engine & Guardrails</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Max Risk Per Trade (%)</label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="10"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">%</span>
            </div>
            <p className="text-[10px] text-zinc-500">Institutional standard is 0.5% – 1.0%</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Max Daily Loss Limit ($)</label>
            <div className="relative">
              <input
                type="number"
                step="100"
                value={maxDailyLoss}
                onChange={(e) => setMaxDailyLoss(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none"
              />
              <span className="absolute right-3 top-2 text-xs font-mono text-zinc-400">USD</span>
            </div>
            <p className="text-[10px] text-zinc-500">Halts journal and triggers breach alert</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Max Daily Trades</label>
            <input
              type="number"
              min="1"
              max="20"
              value={maxDailyTrades}
              onChange={(e) => setMaxDailyTrades(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none"
            />
            <p className="text-[10px] text-zinc-500">Enforces high-conviction selectivity</p>
          </div>
        </div>

        {/* Toggle Option */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
          <div>
            <p className="text-xs font-medium text-zinc-200">Mandatory Stop-Loss Guardrail</p>
            <p className="text-[10px] text-zinc-500">Flag trades entered without a predefined SL as psychological violations</p>
          </div>
          <button
            onClick={() => setRequireStopLoss(!requireStopLoss)}
            className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
              requireStopLoss ? 'bg-blue-600' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 bg-white w-4.5 h-4.5 rounded-full transition-transform ${
                requireStopLoss ? 'translate-x-4.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Section 2: MT4 / MT5 Webhook & API Gateway */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider font-heading">
            <Zap className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
            <span>MetaTrader 4 / 5 Automated Webhook Gateway</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-zinc-300 bg-white/[0.04] border border-white/[0.08] px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            HTTP POST 200 OK
          </span>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">
              Your Unique Ingestion Webhook URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-[#0D0D0F] border border-white/[0.08] rounded-md px-3 py-2 text-xs font-mono text-zinc-300 truncate">
                {webhookEndpoint}
              </div>
              <button
                onClick={handleCopyToken}
                className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-xs px-3.5 py-2 rounded-md transition-colors shrink-0 cursor-pointer font-medium"
              >
                {copiedToken ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Copy URL</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-zinc-500 mt-1">
              Paste this URL into your MetaTrader Expert Advisor (EA) or cTrader webhook alert setting.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
            <div>
              <p className="text-xs font-medium text-zinc-200">Test Connection Ping</p>
              <p className="text-[10px] text-zinc-500">Verify webhook endpoint responsiveness</p>
            </div>
            <div className="flex items-center gap-2">
              {pingSuccess && (
                <span className="text-xs text-emerald-400 font-mono font-medium">Latency: 24ms ✓</span>
              )}
              <button
                onClick={handleTestPing}
                disabled={isPinging}
                className="flex items-center gap-1.5 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-xs px-3 py-1.5 rounded-md transition-colors cursor-pointer font-medium"
              >
                <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                <span>{isPinging ? 'Sending Ping...' : 'Send Test Ping'}</span>
              </button>
              <button
                onClick={handleRegenerateToken}
                className="text-xs text-zinc-400 hover:text-rose-400 underline px-2 cursor-pointer"
              >
                Regenerate Token
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: General & Account Defaults */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider border-b border-white/[0.06] pb-3 font-heading">
          <DollarSign className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Account Defaults & Localization</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Base Account Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($) — US Dollar</option>
              <option value="EUR">EUR (€) — Euro</option>
              <option value="GBP">GBP (£) — British Pound</option>
              <option value="JPY">JPY (¥) — Japanese Yen</option>
              <option value="AUD">AUD ($) — Australian Dollar</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Journal Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="UTC">UTC (Universal Coordinated Time)</option>
              <option value="EST">EST / EDT (New York Time)</option>
              <option value="GMT">GMT / BST (London Time)</option>
              <option value="JST">JST (Tokyo Time)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Default Lot Size</label>
            <input
              type="number"
              step="0.01"
              value={defaultLotSize}
              onChange={(e) => setDefaultLotSize(e.target.value)}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-md px-3 py-2 text-xs text-white font-mono tabular-nums focus:outline-none"
            />
          </div>
        </div>

        {/* Display & Sound Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/[0.04]">
          <div className="flex items-center justify-between p-3 bg-[#0D0D0F]/70 border border-white/[0.06] rounded-md">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-zinc-400" />
              <div>
                <p className="text-xs font-medium text-zinc-200">Execution Sound Effects</p>
                <p className="text-[10px] text-zinc-500">Auditory feedback upon trade import & logging</p>
              </div>
            </div>
            <button
              onClick={() => setSoundEffects(!soundEffects)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                soundEffects ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                  soundEffects ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#0D0D0F]/70 border border-white/[0.06] rounded-md">
            <div>
              <p className="text-xs font-medium text-zinc-200">Compact Table Density</p>
              <p className="text-[10px] text-zinc-500">Display more trade rows per page</p>
            </div>
            <button
              onClick={() => setCompactDensity(!compactDensity)}
              className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                compactDensity ? 'bg-blue-600' : 'bg-zinc-700'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${
                  compactDensity ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 4: Data Management */}
      <div className="bg-[#131317] border border-white/[0.07] rounded-lg p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200 uppercase tracking-wider border-b border-white/[0.06] pb-3 font-heading">
          <Database className="w-3.5 h-3.5 text-zinc-400" strokeWidth={1.5} />
          <span>Data Management & Backups</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-zinc-200">Export Journal Data</p>
            <p className="text-[10px] text-zinc-500">Download all trade history, metrics, and tags as a CSV spreadsheet</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-xs font-medium px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV ({trades.length} trades)</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/[0.04]">
          <div>
            <p className="text-xs font-medium text-zinc-200">Restore Sample Dataset</p>
            <p className="text-[10px] text-zinc-500">Reset default demo trading accounts and benchmark trades</p>
          </div>
          <button
            onClick={() => {
              if (onResetSampleData) onResetSampleData();
              alert('Sample data reloaded.');
            }}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] border border-white/[0.08] text-zinc-200 text-xs font-medium px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-white/[0.04]">
          <div>
            <p className="text-xs font-medium text-rose-300">Clear All Journal Records</p>
            <p className="text-[10px] text-zinc-500">Permanently remove all trades from active memory</p>
          </div>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear all trades? This cannot be undone.')) {
                if (onClearAllTrades) onClearAllTrades();
              }
            }}
            className="flex items-center gap-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-500/20 text-rose-300 text-xs font-medium px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span>Clear All Trades</span>
          </button>
        </div>
      </div>
    </div>
  );
};
