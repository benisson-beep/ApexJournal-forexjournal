'use client';

import React from 'react';
import Link from 'next/link';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1b2336] bg-[#05070b] pt-16 pb-12 px-6 text-slate-400">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs tracking-tighter">
            AJ
          </div>
          <span className="font-extrabold text-slate-100 text-lg tracking-widest font-sans uppercase">
            Apex<span className="text-emerald-400">Journal</span>
          </span>
        </div>

        {/* 4 Categorized Columns (TraderSync Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 text-xs">
          {/* Col 1: PRODUCT */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              PRODUCT
            </h4>
            <ul className="space-y-2.5 font-normal">
              <li>
                <Link href="/dashboard" className="hover:text-slate-100 transition-colors">
                  Performance Analytics
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-100 transition-colors">
                  Real-Time MT4/MT5 Sync
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-100 transition-colors">
                  Monthly P&L Calendar
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-100 transition-colors">
                  Cost of Mistakes Analyzer
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  Supported Brokers & Prop Firms
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-100 transition-colors">
                  SaaS Pricing
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-slate-100 transition-colors flex items-center gap-1.5">
                  <span>What's New</span>
                  <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded font-mono">v1.2</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: COMPANY */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              COMPANY
            </h4>
            <ul className="space-y-2.5 font-normal">
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  Trader Reviews
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  Trading Edge Blog
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-100 transition-colors">
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: SUPPORT */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              SUPPORT
            </h4>
            <ul className="space-y-2.5 font-normal">
              <li>
                <a href="#faq" className="hover:text-slate-100 transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1">
                  <span>Contact Us</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  MT4/MT5 Video Tutorials
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-100 transition-colors">
                  EA Setup How-To
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-slate-100 transition-colors">
                  Forex Trading Glossary
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: LEGAL INFO */}
          <div className="space-y-3.5">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              LEGAL INFO
            </h4>
            <ul className="space-y-2.5 font-normal">
              <li>
                <a href="#faq" className="hover:text-slate-100 transition-colors">
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-slate-100 transition-colors">
                  Billing and Refund Policy
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-100 transition-colors">
                  Risk Disclosure
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-slate-100 transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="border-t border-[#1b2336]/70" />

        {/* Social Icons (Left) + App Store & Google Play Badges (Right) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-1">
          {/* Social Icons (TraderSync Reference) */}
          <div className="flex items-center gap-5">
            {/* X (formerly Twitter) icon */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors"
              title="X (Twitter)"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors"
              title="Instagram"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-slate-100 transition-colors"
              title="YouTube"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>

          {/* App Store & Google Play Download Pills (TraderSync Reference) */}
          <div className="flex items-center gap-3">
            {/* App Store Badge */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-[#000000] border border-[#242f48] hover:border-slate-500 px-3.5 py-1.5 rounded-lg transition-all group"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.36-.58.67-1.09 1.74-.95 2.77.99.08 2.06-.52 2.68-1.28z" />
              </svg>
              <div className="text-left font-sans">
                <span className="text-[9px] text-slate-400 block leading-tight">Download on the</span>
                <span className="text-xs font-bold text-slate-100 tracking-tight block leading-tight">App Store</span>
              </div>
            </Link>

            {/* Google Play Badge */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-[#000000] border border-[#242f48] hover:border-slate-500 px-3.5 py-1.5 rounded-lg transition-all group"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M3.6 2.4c-.2.2-.4.6-.4 1.1v17c0 .5.2.9.4 1.1l9.6-9.6L3.6 2.4z"/>
                <path fill="#FBBC04" d="M16.8 8.8l-3.6 3.2 3.6 3.2 4.1-2.4c1.2-.7 1.2-1.9 0-2.6l-4.1-2.4z"/>
                <path fill="#34A853" d="M3.6 21.6c.7.4 1.7.3 2.5-.2l10.7-6.2-3.6-3.2-9.6 9.6z"/>
                <path fill="#EA4335" d="M16.8 8.8L6.1 2.6C5.3 2.1 4.3 2 3.6 2.4l9.6 9.6 3.6-3.2z"/>
              </svg>
              <div className="text-left font-sans">
                <span className="text-[9px] text-slate-400 block leading-tight">GET IT ON</span>
                <span className="text-xs font-bold text-slate-100 tracking-tight block leading-tight">Google Play</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Detailed Risk & Regulatory Disclaimers (Exact TraderSync Formulation) */}
        <div className="space-y-3 pt-4 text-[11px] text-slate-400 leading-relaxed font-sans">
          <p>
            ApexJournal is a comprehensive suite of research, analysis, and trading tools designed to assist traders and investors in making their own decisions. We do not provide recommendations regarding specific securities, currencies, or commodities to buy or sell, and we do not offer trading or investing advice. Trading carries significant risk and may not be suitable for every investor. There is a possibility of losing all or more than the initial investment.
          </p>
          <p>
            Testimonials appearing on this website may not be representative of other clients or customers and is not a guarantee of future performance or success.
          </p>
        </div>
      </div>
    </footer>
  );
};
