'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export const SupportSection: React.FC = () => {
  return (
    <section id="support" className="py-24 px-6 max-w-[1280px] mx-auto space-y-12 relative">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-blue-600/5 blur-[120px] pointer-events-none rounded-full" />

      {/* SVG Gradient Definitions for Neon Icons */}
      <svg className="sr-only" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <linearGradient id="neonGradient3" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
        </defs>
      </svg>

      {/* Section Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto relative z-10">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] font-mono bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full inline-block">
            LEARNING CENTER
          </span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-extrabold tracking-tight leading-[1.15] text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
          Supporting You Every
          <br className="hidden sm:inline" /> Step of the Way
        </h2>
      </div>

      {/* 3-Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Card 1: Live Chat */}
        <div className="bg-[#131317] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
          <div className="space-y-4">
            {/* Live Chat Bubble Icon with Gradient Stroke */}
            <div className="w-12 h-12 flex items-center justify-start">
              <svg
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#neonGradient1)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                <circle cx="8" cy="12" r="0.75" fill="url(#neonGradient1)" stroke="none" />
                <circle cx="12" cy="12" r="0.75" fill="url(#neonGradient1)" stroke="none" />
                <circle cx="16" cy="12" r="0.75" fill="url(#neonGradient1)" stroke="none" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                Live Chat
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Connect with our expert support team anytime for fast, helpful assistance.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
            >
              <span>Talk to experts</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Card 2: The Blog */}
        <div className="bg-[#131317] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
          <div className="space-y-4">
            {/* Whiteboard / Presentation Stand Icon with Gradient Stroke */}
            <div className="w-12 h-12 flex items-center justify-start">
              <svg
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(129,140,248,0.25)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="url(#neonGradient2)"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Board Frame */}
                <rect x="3" y="3" width="18" height="12" rx="2" />
                {/* Board Marker Ledge */}
                <path d="M7 15h10" />
                {/* Tripod Legs */}
                <path d="M8 15l-2.5 6" />
                <path d="M16 15l2.5 6" />
                <path d="M12 15v5" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                The Blog
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Access comprehensive guides and insights to help you build a profitable trading strategy.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <a
              href="#features"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
            >
              <span>Read articles</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Card 3: AI Assistant */}
        <div className="bg-[#131317] border border-white/[0.08] hover:border-white/[0.18] rounded-2xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:-translate-y-1">
          <div className="space-y-4">
            {/* Soundwave / Neural Bars Icon with Gradient Fill */}
            <div className="w-12 h-12 flex items-center justify-start">
              <svg
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(192,132,252,0.25)]"
                viewBox="0 0 24 24"
                fill="url(#neonGradient3)"
              >
                <rect x="2.5" y="9.5" width="2" height="5" rx="1" />
                <rect x="6" y="6" width="2" height="12" rx="1" />
                <rect x="9.5" y="3" width="2" height="18" rx="1" />
                <rect x="13" y="4.5" width="2" height="15" rx="1" />
                <rect x="16.5" y="7" width="2" height="10" rx="1" />
                <rect x="20" y="10" width="2" height="4" rx="1" />
              </svg>
            </div>

            <div>
              <h3 className="text-xl font-heading font-bold text-white mb-2">
                AI Assistant
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-sans">
                Ask your AI assistant for instant answers and video tutorials tailored to your needs.
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-blue-400 group-hover:text-blue-300 transition-colors"
            >
              <span>Ask Cypher</span>
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
