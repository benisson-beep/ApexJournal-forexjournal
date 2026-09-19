'use client';

import React, { useState } from 'react';
import { parseMetaTraderCsv } from '../../lib/statement-parser';
import { Trade } from '../../types/trade';
import { AlertCircle, Check, FileText, Upload, X } from 'lucide-react';

interface ImportStatementModalProps {
  isOpen: boolean;
  accountId: string;
  onClose: () => void;
  onImportTrades: (trades: Trade[]) => void;
}

export const ImportStatementModal: React.FC<ImportStatementModalProps> = ({
  isOpen,
  accountId,
  onClose,
  onImportTrades,
}) => {
  const [csvText, setCsvText] = useState('');
  const [previewTrades, setPreviewTrades] = useState<Trade[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      parseContent(content);
    };
    reader.readAsText(file);
  };

  const parseContent = (content: string) => {
    try {
      const parsed = parseMetaTraderCsv(content, accountId);
      if (parsed.length === 0) {
        setErrorMessage('No valid closed trade rows found. Ensure file is an MT4/MT5 statement report.');
        setPreviewTrades([]);
      } else {
        setErrorMessage(null);
        setPreviewTrades(parsed);
      }
    } catch (err) {
      setErrorMessage('Failed to parse statement file.');
      setPreviewTrades([]);
    }
  };

  const handleConfirmImport = () => {
    if (previewTrades.length > 0) {
      onImportTrades(previewTrades);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#18181E] border border-white/[0.08] rounded-lg w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-white/[0.06] flex items-center justify-between bg-[#131317]">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-zinc-400" strokeWidth={1.5} />
            <h3 className="font-semibold text-zinc-100 text-sm tracking-tight font-heading">
              Import MetaTrader Statement (CSV / HTML)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md hover:bg-white/5 cursor-pointer"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-400 leading-relaxed">
            In MT4/MT5, right-click on <strong>Account History</strong> $\rightarrow$ select <strong>Report</strong> or <strong>Save as Detailed Report</strong>, then upload the file below or paste its content.
          </p>

          {/* File Dropzone */}
          <label className="border border-dashed border-white/[0.12] hover:border-blue-500/40 bg-[#131317] rounded-md p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <Upload className="w-6 h-6 text-zinc-400 group-hover:text-blue-400 mb-2 transition-colors" strokeWidth={1.5} />
            <span className="text-xs font-medium text-zinc-200">
              Click to select statement file (.csv, .txt, .htm)
            </span>
            <span className="text-[11px] text-zinc-500 mt-1">Automatic column detection</span>
            <input
              type="file"
              accept=".csv,.txt,.htm,.html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Direct Paste Area */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 uppercase tracking-wider mb-1">
              Or Paste Statement Raw Data
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                parseContent(e.target.value);
              }}
              placeholder="Paste comma-delimited or tab-separated MT4/MT5 report rows here..."
              className="w-full bg-[#0D0D0F] border border-white/[0.08] rounded-md p-2.5 text-xs font-mono text-zinc-200 outline-none focus:border-blue-500/50 resize-none placeholder-zinc-500"
            />
          </div>

          {/* Status & Preview */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span>{errorMessage}</span>
            </div>
          )}

          {previewTrades.length > 0 && (
            <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between font-mono tabular-nums">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" strokeWidth={1.5} />
                Detected {previewTrades.length} closed trades ready for import!
              </span>
              <span className="text-zinc-300">
                P&L: ${previewTrades.reduce((acc, t) => acc + t.netPnl, 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/[0.06]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 rounded-md hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={previewTrades.length === 0}
              className="px-5 py-2 text-xs font-medium bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Import {previewTrades.length > 0 ? `${previewTrades.length} Trades` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
