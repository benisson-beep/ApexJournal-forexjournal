'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-[#1b2336] bg-[#080b11] pt-16 pb-12 px-6">
      <div className="max-w-[1280px] mx-auto space-y-12">
        {/* Pre-Footer Final Call to Action */}
        <div className="bg-gradient-to-b from-[#111622] to-[#0e131f] border border-[#1b2336] rounded-2xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden">
          <div className="space-y-2 max-w-xl mx-auto">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Ready to Trade With Institutional Discipline?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Join disciplined prop traders tracking their statistical edge with ApexJournal. Setup takes less than 3 minutes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-[#080b11] font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-xl shadow-emerald-500/25"
            >
              <span>Launch Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Footer Navigation & Brand */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 text-xs text-slate-400">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
              AJ
            </div>
            <span className="font-bold text-slate-200">
              Apex<span className="text-emerald-400">Journal</span>
            </span>
            <span className="text-slate-600">·</span>
            <span>© 2026 ApexJournal SaaS. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-slate-200 transition-colors">
              Features
            </a>
            <a href="#pricing" className="hover:text-slate-200 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="hover:text-slate-200 transition-colors">
              FAQ
            </a>
            <Link href="/dashboard" className="text-emerald-400 hover:text-emerald-300 font-medium">
              Open App $\rightarrow$
            </Link>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="border-t border-[#1b2336]/60 pt-6 text-[10px] text-slate-400 leading-relaxed max-w-4xl mx-auto text-center">
          <strong>Risk Disclosure:</strong> Foreign exchange and futures trading on margin carries a high level of risk and may not be suitable for all investors. ApexJournal is an analytical journal and statistical tracking tool and does not provide financial or investment advice.
        </div>
      </div>
    </footer>
  );
};
