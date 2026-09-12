'use client';

import React from 'react';

const PARTNERS = [
  { name: 'FTMO', subtitle: 'Prop Firm' },
  { name: 'IC Markets', subtitle: 'Raw ECN Broker' },
  { name: 'FundedNext', subtitle: 'Funding Evaluation' },
  { name: 'Pepperstone', subtitle: 'cTrader / MT5' },
  { name: 'Apex Funding', subtitle: 'Futures & FX' },
  { name: 'MetaTrader 5', subtitle: 'Native Terminal' },
  { name: 'MetaTrader 4', subtitle: 'Legacy Sync' },
];

export const PropFirmStrip: React.FC = () => {
  return (
    <div className="border-y border-[#1b2336] bg-[#090d16]/70 py-8 px-6">
      <div className="max-w-[1280px] mx-auto text-center space-y-4">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          Seamlessly Compatible With All Major Prop Firms & Regulated Brokers
        </p>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 pt-2 opacity-80 hover:opacity-100 transition-opacity">
          {PARTNERS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center justify-center p-2 group cursor-default"
            >
              <span className="font-bold text-slate-300 group-hover:text-emerald-400 text-sm tracking-tight transition-colors">
                {p.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{p.subtitle}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
