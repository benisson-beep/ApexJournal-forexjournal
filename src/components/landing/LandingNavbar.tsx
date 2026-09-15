'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md px-6 py-4">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm tracking-tighter group-hover:scale-105 transition-transform">
            AJ
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-100 text-base tracking-tight font-sans">
              Apex<span className="text-emerald-400">Journal</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              PRO
            </span>
          </div>
        </Link>

        {/* Center Links */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-bold text-slate-200">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#integrations" className="hover:text-white transition-colors">
            MT4 & MT5 Sync
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            FAQ
          </a>
          <a href="#contact" className="hover:text-white transition-colors">
            Contact
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-200 hover:text-white px-3 py-2 rounded-lg transition-colors hidden sm:block"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 bg-[#00c97b] hover:bg-emerald-400 active:scale-[0.98] text-black font-extrabold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25"
          >
            <span>Launch Journal</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    </header>
  );
};
