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

      {/* Floating Support Button */}
      <a
        href="#contact"
        className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white shadow-xl shadow-blue-500/25 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer"
        title="Live Support"
        aria-label="Contact Support"
      >
        <MessageSquare className="w-5 h-5 fill-white/20" />
      </a>
    </div>
  );
}
