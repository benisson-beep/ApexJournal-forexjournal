'use client';

import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { PropFirmStrip } from '../components/landing/PropFirmStrip';
import { FeatureBento } from '../components/landing/FeatureBento';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';
import { SupportSection } from '../components/landing/SupportSection';
import { ContactSection } from '../components/landing/ContactSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { MessageSquare } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300 relative">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <PropFirmStrip />
        <FeatureBento />
        <PricingSection />
        <FaqSection />
        <SupportSection />
        <ContactSection />
      </main>
      <LandingFooter />

      {/* Support / Contact Trigger */}
      <a
        href="#contact"
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#131620] hover:bg-[#1a1f2e] border border-white/10 hover:border-white/25 text-slate-300 hover:text-white shadow-xl shadow-black/80 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Contact Desk"
        aria-label="Contact Desk"
      >
        <MessageSquare className="w-4 h-4" />
      </a>
    </div>
  );
}
