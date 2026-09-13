'use client';

import React from 'react';

interface Partner {
  name: string;
  category: string;
  badge: string;
  glowColor: string;
  logo: React.ReactNode;
}

const PARTNERS: Partner[] = [
  // 1. FTMO Official Logo
  {
    name: 'FTMO',
    category: 'The World\'s Leading Prop Firm',
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-cyan-500/40 group-hover:shadow-[0_0_25px_rgba(0,178,254,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="ftmo-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D2FF" />
            <stop offset="100%" stopColor="#0077FE" />
          </linearGradient>
          <linearGradient id="ftmo-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0055FE" />
            <stop offset="100%" stopColor="#0022AA" />
          </linearGradient>
        </defs>
        {/* Official FTMO 2-Piece Angled Diamond Geometry */}
        <polygon points="18,3 32,10 32,24 20,18" fill="url(#ftmo-cyan)" />
        <polygon points="18,33 4,26 4,12 16,18" fill="url(#ftmo-blue)" />
        <line x1="16" y1="18" x2="20" y2="18" stroke="#07090f" strokeWidth="2" />
      </svg>
    ),
  },

  // 2. MetaTrader 5 Official Logo
  {
    name: 'MetaTrader 5',
    category: 'Native Terminal Webhook',
    badge: 'MT5 ENGINE',
    glowColor: 'group-hover:border-blue-500/40 group-hover:shadow-[0_0_25px_rgba(0,132,255,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="mt5-grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#29B6F6" />
            <stop offset="100%" stopColor="#0288D1" />
          </linearGradient>
          <linearGradient id="mt5-grad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0288D1" />
            <stop offset="100%" stopColor="#01579B" />
          </linearGradient>
          <linearGradient id="mt5-grad3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4FC3F7" />
            <stop offset="100%" stopColor="#039BE5" />
          </linearGradient>
        </defs>
        {/* Official 3-Petal MetaQuotes Clover */}
        <circle cx="18" cy="11" r="6" fill="url(#mt5-grad1)" opacity="0.9" />
        <circle cx="24" cy="22" r="6" fill="url(#mt5-grad2)" opacity="0.9" />
        <circle cx="12" cy="22" r="6" fill="url(#mt5-grad3)" opacity="0.9" />
        <circle cx="18" cy="18" r="2.5" fill="#07090f" />
      </svg>
    ),
  },

  // 3. IC Markets Official Logo
  {
    name: 'IC Markets',
    category: 'True ECN Raw Spreads',
    badge: 'GLOBAL BROKER',
    glowColor: 'group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(0,242,155,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="ic-green-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F29B" />
            <stop offset="100%" stopColor="#00DF89" />
          </linearGradient>
          <linearGradient id="ic-green-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00C87A" />
            <stop offset="100%" stopColor="#009E5F" />
          </linearGradient>
          <linearGradient id="ic-green-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#009E5F" />
            <stop offset="100%" stopColor="#00683E" />
          </linearGradient>
        </defs>
        {/* Official 3D Isometric Green Cube */}
        <polygon points="18,4 30,11 18,18 6,11" fill="url(#ic-green-top)" />
        <polygon points="6,11 18,18 18,32 6,25" fill="url(#ic-green-left)" />
        <polygon points="30,11 18,18 18,32 30,25" fill="url(#ic-green-right)" />
      </svg>
    ),
  },

  // 4. FundedNext Official Logo
  {
    name: 'FundedNext',
    category: 'Futures & FX Evaluation',
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-fuchsia-500/40 group-hover:shadow-[0_0_25px_rgba(217,70,239,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="fn-pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="fn-purple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9333EA" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
        {/* Official FN Interlocking Ribbon */}
        <path d="M7 6h6v24H7z" fill="url(#fn-purple)" rx="1.5" />
        <path d="M17 6h5l-7 12 7 12h-5l-7-12 7-12z" fill="url(#fn-pink)" />
      </svg>
    ),
  },

  // 5. Pepperstone Official Logo
  {
    name: 'Pepperstone',
    category: 'ASIC / FCA Regulated',
    badge: 'ECN BROKER',
    glowColor: 'group-hover:border-rose-500/40 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="pep-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3355" />
            <stop offset="100%" stopColor="#D91E36" />
          </linearGradient>
        </defs>
        {/* Official Pepperstone Folded Origami P */}
        <path
          d="M10 5h10a8 8 0 0 1 8 8c0 4.418-3.582 8-8 8h-4v10H10V5zm6 11h4a3 3 0 0 0 3-3 3 3 0 0 0-3-3h-4v6z"
          fill="url(#pep-red)"
        />
      </svg>
    ),
  },

  // 6. Apex Trader Funding Official Logo
  {
    name: 'Apex Funding',
    category: 'Prop Futures Trading',
    badge: 'FUTURES',
    glowColor: 'group-hover:border-emerald-500/40 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="apex-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        {/* Official Apex Mountain Chevron */}
        <polygon points="18,4 32,29 26,29 18,14 10,29 4,29" fill="url(#apex-green)" />
        <polygon points="18,17 23,26 13,26" fill="#F8FAFC" opacity="0.9" />
      </svg>
    ),
  },

  // 7. Topstep Official Logo
  {
    name: 'Topstep',
    category: 'Funded Trader Program',
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="topstep-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
        {/* Official Topstep Ascending Stair Bars */}
        <rect x="6" y="22" width="6" height="8" rx="1.5" fill="url(#topstep-gold)" opacity="0.6" />
        <rect x="15" y="14" width="6" height="16" rx="1.5" fill="url(#topstep-gold)" opacity="0.8" />
        <rect x="24" y="6" width="6" height="24" rx="1.5" fill="url(#topstep-gold)" />
      </svg>
    ),
  },

  // 8. MetaTrader 4 Official Logo
  {
    name: 'MetaTrader 4',
    category: 'Legacy Terminal Webhook',
    badge: 'MT4 ENGINE',
    glowColor: 'group-hover:border-amber-500/40 group-hover:shadow-[0_0_25px_rgba(255,184,0,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="mt4-gold1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD54F" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
          <linearGradient id="mt4-gold2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA000" />
            <stop offset="100%" stopColor="#E65100" />
          </linearGradient>
          <linearGradient id="mt4-gold3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE082" />
            <stop offset="100%" stopColor="#FFB300" />
          </linearGradient>
        </defs>
        {/* Official 3-Petal MetaQuotes Gold Clover */}
        <circle cx="18" cy="11" r="6" fill="url(#mt4-gold1)" opacity="0.9" />
        <circle cx="24" cy="22" r="6" fill="url(#mt4-gold2)" opacity="0.9" />
        <circle cx="12" cy="22" r="6" fill="url(#mt4-gold3)" opacity="0.9" />
        <circle cx="18" cy="18" r="2.5" fill="#07090f" />
      </svg>
    ),
  },

  // 9. cTrader Official Logo
  {
    name: 'cTrader',
    category: 'Spotware Open API Platform',
    badge: 'API BRIDGE',
    glowColor: 'group-hover:border-cyan-400/40 group-hover:shadow-[0_0_25px_rgba(0,210,196,0.15)]',
    logo: (
      <svg className="w-8 h-8 shrink-0" viewBox="0 0 36 36" fill="none">
        <defs>
          <linearGradient id="ctrader-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F0FF" />
            <stop offset="100%" stopColor="#00A3A6" />
          </linearGradient>
        </defs>
        {/* Official cTrader Ring */}
        <circle cx="18" cy="18" r="14" stroke="url(#ctrader-teal)" strokeWidth="3.5" />
        <path
          d="M23 13a7 7 0 1 0 0 10"
          stroke="#F8FAFC"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export const PropFirmStrip: React.FC = () => {
  return (
    <div className="border-y border-[#1b2336] bg-[#07090f] py-9 overflow-hidden relative select-none">
      {/* Label Header */}
      <div className="max-w-[1280px] mx-auto text-center px-6 mb-7">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>SEAMLESSLY COMPATIBLE WITH ALL MAJOR PROP FIRMS & REGULATED BROKERS</span>
        </p>
      </div>

      {/* Left & Right Gradient Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-r from-[#07090f] via-[#07090f]/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-48 bg-gradient-to-l from-[#07090f] via-[#07090f]/80 to-transparent z-20 pointer-events-none" />

      {/* Infinite Moving Marquee Track (Right to Left) */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 sm:gap-7 shrink-0">
          {/* Loop Set 1 */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p1-${index}`}
              className={`flex items-center gap-3.5 bg-[#0e131f] border border-[#1b2336] ${partner.glowColor} transition-all duration-200 px-5 py-3 rounded-2xl cursor-default shrink-0 group shadow-md`}
            >
              <div className="p-1.5 rounded-xl bg-[#080b11] border border-[#1c2436] group-hover:scale-105 transition-transform flex items-center justify-center">
                {partner.logo}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
                  {partner.category}
                </span>
              </div>
            </div>
          ))}

          {/* Loop Set 2 (Duplicate for Seamless Loop) */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p2-${index}`}
              className={`flex items-center gap-3.5 bg-[#0e131f] border border-[#1b2336] ${partner.glowColor} transition-all duration-200 px-5 py-3 rounded-2xl cursor-default shrink-0 group shadow-md`}
            >
              <div className="p-1.5 rounded-xl bg-[#080b11] border border-[#1c2436] group-hover:scale-105 transition-transform flex items-center justify-center">
                {partner.logo}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-sm tracking-tight group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-sans block mt-0.5">
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
