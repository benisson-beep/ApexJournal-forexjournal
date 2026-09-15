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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#0e131f] border border-[#1b2336] rounded-2xl w-full max-w-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 px-6 border-b border-[#1b2336] flex items-center justify-between bg-[#0a0d14]/60">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm tracking-tight">
              Import MetaTrader Statement (CSV / HTML)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-[#1b2336]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            In MT4/MT5, right-click on <strong>Account History</strong> $\rightarrow$ select <strong>Report</strong> or <strong>Save as Detailed Report</strong>, then upload the file below or paste its content.
          </p>

          {/* File Dropzone */}
          <label className="border-2 border-dashed border-[#1b2336] hover:border-emerald-500/40 bg-[#131929]/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors group">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-400 mb-2 transition-colors" />
            <span className="text-xs font-semibold text-slate-200">
              Click to select statement file (.csv, .txt, .htm)
            </span>
            <span className="text-[11px] text-slate-400 mt-1">Automatic column detection</span>
            <input
              type="file"
              accept=".csv,.txt,.htm,.html"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Direct Paste Area */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
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
              className="w-full bg-[#131929] border border-[#1b2336] rounded-lg p-2.5 text-xs font-mono text-slate-200 outline-none focus:border-emerald-500/50 resize-none placeholder-slate-400"
            />
          </div>

          {/* Status & Preview */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {previewTrades.length > 0 && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center justify-between font-mono">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                Detected {previewTrades.length} closed trades ready for import!
              </span>
              <span className="text-slate-300">
                P&L: ${previewTrades.reduce((acc, t) => acc + t.netPnl, 0).toFixed(2)}
              </span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#1b2336]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={previewTrades.length === 0}
              className="px-5 py-2 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Import {previewTrades.length > 0 ? `${previewTrades.length} Trades` : ''}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
