'use client';

import React from 'react';

interface Partner {
  name: string;
  category: string;
  badge: string;
  glowColor: string;
  logoSrc: string;
  imgClassName?: string;
}

const PARTNERS: Partner[] = [
  // 1. FTMO Official Logo
  {
    name: 'FTMO',
    category: "The World's Leading Prop Firm",
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-cyan-500/40',
    logoSrc: '/logos/ftmo.png',
    imgClassName: 'w-8 h-8 object-contain',
  },

  // 2. MetaTrader 5 Official Logo
  {
    name: 'MetaTrader 5',
    category: 'Native Terminal Webhook',
    badge: 'MT5 ENGINE',
    glowColor: 'group-hover:border-blue-500/40',
    logoSrc: '/logos/mt5.png',
    imgClassName: 'h-7 w-auto object-contain max-w-[125px]',
  },

  // 3. IC Markets Official Logo
  {
    name: 'IC Markets',
    category: 'True ECN Raw Spreads',
    badge: 'GLOBAL BROKER',
    glowColor: 'group-hover:border-emerald-500/40',
    logoSrc: '/logos/icmarkets.png',
    imgClassName: 'h-7 w-auto object-contain max-w-[135px]',
  },

  // 4. FundedNext Official Logo
  {
    name: 'FundedNext',
    category: 'Futures & FX Evaluation',
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-fuchsia-500/40',
    logoSrc: '/logos/fundednext.png',
    imgClassName: 'w-8 h-8 object-contain rounded-md',
  },

  // 5. Pepperstone Official Logo
  {
    name: 'Pepperstone',
    category: 'ASIC / FCA Regulated',
    badge: 'ECN BROKER',
    glowColor: 'group-hover:border-rose-500/40',
    logoSrc: '/logos/pepperstone.png',
    imgClassName: 'w-8 h-8 object-contain',
  },

  // 6. Apex Trader Funding Official Logo
  {
    name: 'Apex Funding',
    category: 'Prop Futures Trading',
    badge: 'FUTURES',
    glowColor: 'group-hover:border-emerald-500/40',
    logoSrc: '/logos/apex.png',
    imgClassName: 'h-7 w-auto object-contain max-w-[125px]',
  },

  // 7. Topstep Official Logo
  {
    name: 'Topstep',
    category: 'Funded Trader Program',
    badge: 'PROP FIRM',
    glowColor: 'group-hover:border-amber-500/40',
    logoSrc: '/logos/topstep.webp',
    imgClassName: 'h-6 w-auto object-contain max-w-[115px]',
  },

  // 8. MetaTrader 4 Official Logo
  {
    name: 'MetaTrader 4',
    category: 'Legacy Terminal Webhook',
    badge: 'MT4 ENGINE',
    glowColor: 'group-hover:border-amber-500/40',
    logoSrc: '/logos/mt4.png',
    imgClassName: 'h-7 w-auto object-contain max-w-[125px]',
  },

  // 9. cTrader Official Logo
  {
    name: 'cTrader',
    category: 'Spotware Open API Platform',
    badge: 'API BRIDGE',
    glowColor: 'group-hover:border-cyan-400/40',
    logoSrc: '/logos/ctrader.png',
    imgClassName: 'h-7 w-auto object-contain max-w-[125px]',
  },
];

export const PropFirmStrip: React.FC = () => {
  return (
    <div className="border-y border-white/10 bg-black py-16 sm:py-20 overflow-hidden relative select-none">
      {/* Label Header */}
      <div className="max-w-[1280px] mx-auto text-center px-6 mb-9 sm:mb-11">
        <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">
          <span>SEAMLESSLY COMPATIBLE WITH ALL MAJOR PROP FIRMS & REGULATED BROKERS</span>
        </p>
      </div>

      {/* Left & Right Gradient Fade Masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-56 bg-gradient-to-r from-black via-black/80 to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-56 bg-gradient-to-l from-black via-black/80 to-transparent z-20 pointer-events-none" />

      {/* Infinite Moving Marquee Track (Right to Left) */}
      <div className="flex w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-6 sm:gap-8 shrink-0">
          {/* Loop Set 1 */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p1-${index}`}
              className={`flex items-center gap-4 bg-black border border-white/10 ${partner.glowColor} transition-all duration-200 px-6 py-4 sm:py-5 rounded-2xl cursor-default shrink-0 group hover:border-white/25`}
            >
              <div className="p-2 rounded-xl bg-[#080c14] border border-white/10 group-hover:scale-105 transition-transform flex items-center justify-center min-w-[44px] h-12">
                <img
                  src={partner.logoSrc}
                  alt={partner.name}
                  className={partner.imgClassName || 'w-8 h-8 object-contain'}
                  loading="lazy"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-sans block mt-1">
                  {partner.category}
                </span>
              </div>
            </div>
          ))}

          {/* Loop Set 2 (Duplicate for Seamless Infinite Loop) */}
          {PARTNERS.map((partner, index) => (
            <div
              key={`p2-${index}`}
              className={`flex items-center gap-4 bg-black border border-white/10 ${partner.glowColor} transition-all duration-200 px-6 py-4 sm:py-5 rounded-2xl cursor-default shrink-0 group hover:border-white/25`}
            >
              <div className="p-2 rounded-xl bg-[#080c14] border border-white/10 group-hover:scale-105 transition-transform flex items-center justify-center min-w-[44px] h-12">
                <img
                  src={partner.logoSrc}
                  alt={partner.name}
                  className={partner.imgClassName || 'w-8 h-8 object-contain'}
                  loading="lazy"
                />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-100 text-sm sm:text-base tracking-tight group-hover:text-white transition-colors">
                    {partner.name}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    {partner.badge}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-sans block mt-1">
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
