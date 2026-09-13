'use client';

import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { PropFirmStrip } from '../components/landing/PropFirmStrip';
import { FeatureBento } from '../components/landing/FeatureBento';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';
import { ContactSection } from '../components/landing/ContactSection';
import { LandingFooter } from '../components/landing/LandingFooter';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <PropFirmStrip />
        <FeatureBento />
        <PricingSection />
        <FaqSection />
        <ContactSection />
      </main>
      <LandingFooter />
    </div>
  );
}
