'use client';

import React from 'react';

interface Partner {
  name: string;
  category: string;
  logo: React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    name: 'FTMO',
    category: 'Prop Evaluation',
    logo: (
      <svg className="w-5 h-5 text-cyan-400 fill-current" viewBox="0 0 24 24">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="12 6 18 10 18 14 12 18 6 14 6 10" fill="currentColor" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: 'IC Markets',
    category: 'True ECN Broker',
    logo: (
      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    name: 'FundedNext',
    category: 'Prop Firm',
    logo: (
      <svg className="w-5 h-5 text-fuchsia-400" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4 4h7v16H4zM13 4h7l-4 8 4 8h-7z" opacity="0.85" />
      </svg>
    ),
  },
  {
    name: 'Pepperstone',
    category: 'FSA / ASIC Regulated',
    logo: (
      <svg className="w-5 h-5 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.8l7 3.5v7.4l-7 3.5-7-3.5V8.3l7-3.5z"/>
      </svg>
    ),
  },
  {
    name: 'Apex Funding',
    category: 'Futures & Forex',
    logo: (
      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 3 2 21 22 21" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
        <polygon points="12 8 6 19 18 19" fill="currentColor" opacity="0.5" />
      </svg>
    ),
  },
  {
    name: 'MetaTrader 5',
    category: 'Native Terminal Sync',
    logo: (
      <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="3.5" />
        <circle cx="18" cy="7" r="3.5" />
        <circle cx="18" cy="17" r="3.5" />
        <path d="M6 12l12-5M6 12l12 5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: 'Topstep',
    category: 'Funded Futures',
    logo: (
      <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
  {
    name: 'MetaTrader 4',
    category: 'Legacy Webhook EA',
    logo: (
      <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="6" cy="12" r="3.5" />
        <circle cx="18" cy="7" r="3.5" />
        <circle cx="18" cy="17" r="3.5" />
        <path d="M6 12l12-5M6 12l12 5" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    name: 'cTrader',
    category: 'Open API Bridge',
    logo: (
      <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7a5 5 0 1 0 5 5" />
      </svg>
    ),
  },
];

export const PropFirmStrip: React.FC = () => {
  return (
    <div className="border-y border-[#1b2336] bg-[#07090f] py-8 overflow-hidden relative select-none">
      {/* Label Header */}
      <div className="max-w-[1280px] mx-auto text-center px-6 mb-6">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          SEAMLESSLY COMPATIBLE WITH ALL MAJOR PROP FIRMS & REGULATED BROKERS
        </p>
      </div>

      {/* Left & Right Gradient Fade Masks for Smooth Infinite Flow */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-r from-[#07090f] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 bg-gradient-to-l from-[#07090f] to-transparent z-20 pointer-events-none" />

      {/* Infinite Scrolling Track (Moving Right to Left) */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 sm:gap-8 shrink-0">
          {/* First Set */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p1-${index}`}
              className="flex items-center gap-3 bg-[#0d121c] border border-[#1b2336] hover:border-emerald-500/40 hover:bg-[#121926] transition-all px-4 py-2.5 rounded-xl cursor-default shrink-0 group"
            >
              <div className="p-1.5 rounded-lg bg-[#151c2a] border border-[#242f48] group-hover:scale-110 transition-transform">
                {partner.logo}
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 text-xs tracking-tight group-hover:text-emerald-400 transition-colors block">
                  {partner.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {partner.category}
                </span>
              </div>
            </div>
          ))}

          {/* Duplicate Set for Seamless Infinite Loop */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p2-${index}`}
              className="flex items-center gap-3 bg-[#0d121c] border border-[#1b2336] hover:border-emerald-500/40 hover:bg-[#121926] transition-all px-4 py-2.5 rounded-xl cursor-default shrink-0 group"
            >
              <div className="p-1.5 rounded-lg bg-[#151c2a] border border-[#242f48] group-hover:scale-110 transition-transform">
                {partner.logo}
              </div>
              <div className="text-left">
                <span className="font-bold text-slate-200 text-xs tracking-tight group-hover:text-emerald-400 transition-colors block">
                  {partner.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {partner.category}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
