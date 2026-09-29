'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Globe,
  Clock,
  Save,
  Check,
  Award,
} from 'lucide-react';
import { Trade } from '../../types/trade';

interface SettingsViewProps {
  trades?: Trade[];
  onResetSampleData?: () => void;
  onClearAllTrades?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = () => {
  // Trader Profile State
  const [traderName, setTraderName] = useState('Trader');
  const [email, setEmail] = useState('trader@apexjournal.io');
  const [tradingStyle, setTradingStyle] = useState('Discretionary Day Trader');
  const [experience, setExperience] = useState('Advanced / Funded (3+ years)');
  const [preferredCurrency, setPreferredCurrency] = useState('USD');
  const [primarySession, setPrimarySession] = useState('New York');
  const [bio, setBio] = useState(
    'Discretionary trader focused on liquidity sweeps, session momentum, and strict risk execution.'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load profile settings from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedName = localStorage.getItem('apex_profile_name');
      if (savedName) setTraderName(savedName);

      const savedEmail = localStorage.getItem('apex_profile_email');
      if (savedEmail) setEmail(savedEmail);

      const savedStyle = localStorage.getItem('apex_profile_style');
      if (savedStyle) setTradingStyle(savedStyle);

      const savedExp = localStorage.getItem('apex_profile_experience');
      if (savedExp) setExperience(savedExp);

      const savedCurr = localStorage.getItem('apex_profile_currency');
      if (savedCurr) setPreferredCurrency(savedCurr);

      const savedSession = localStorage.getItem('apex_profile_session');
      if (savedSession) setPrimarySession(savedSession);

      const savedBio = localStorage.getItem('apex_profile_bio');
      if (savedBio) setBio(savedBio);
    } catch (e) {
      console.error('Failed to load profile settings from localStorage', e);
    }
  }, []);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('apex_profile_name', traderName);
        localStorage.setItem('apex_profile_email', email);
        localStorage.setItem('apex_profile_style', tradingStyle);
        localStorage.setItem('apex_profile_experience', experience);
        localStorage.setItem('apex_profile_currency', preferredCurrency);
        localStorage.setItem('apex_profile_session', primarySession);
        localStorage.setItem('apex_profile_bio', bio);

        // Notify other components if needed
        window.dispatchEvent(new Event('apex_profile_updated'));
      } catch (err) {
        console.error('Failed to persist profile settings', err);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Avatar Initials
  const initials =
    traderName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TR';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header with Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-white font-heading">
            Profile Settings
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your trader identity, contact details, and primary trading preferences
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-medium text-xs px-4 py-2 rounded-md transition-colors cursor-pointer shrink-0"
        >
          {savedSuccess ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Trader Identity Card */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-500/5 border border-blue-500/30 text-blue-400 font-heading font-bold text-lg flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight font-heading">
                {traderName || 'Trader'}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {email || 'No email specified'}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  {tradingStyle}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                  {preferredCurrency} Base
                </span>
              </div>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Trader Name / Handle</span>
              </label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                placeholder="Enter your trader handle or name"
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none transition-colors"
              />
            </div>

            {/* Trading Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Trading Style</span>
              </label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Discretionary Day Trader">Discretionary Day Trader</option>
                <option value="Price Action / Liquidity Trader">Price Action / Liquidity Trader</option>
                <option value="Scalper (1m - 5m)">Scalper (1m - 5m)</option>
                <option value="Swing Trader (4H - Daily)">Swing Trader (4H - Daily)</option>
                <option value="Systematic / Algorithmic Trader">Systematic / Algorithmic Trader</option>
                <option value="Position Trader">Position Trader</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-slate-400" />
                <span>Experience Level</span>
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Developing Trader (< 1 year)">Developing Trader (&lt; 1 year)</option>
                <option value="Intermediate Trader (1-3 years)">Intermediate Trader (1-3 years)</option>
                <option value="Advanced / Funded (3+ years)">Advanced / Funded (3+ years)</option>
                <option value="Full-Time Professional (5+ years)">Full-Time Professional (5+ years)</option>
              </select>
            </div>

            {/* Preferred Base Currency */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Base Account Currency</span>
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="USD">USD ($) — US Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="GBP">GBP (£) — British Pound</option>
                <option value="JPY">JPY (¥) — Japanese Yen</option>
                <option value="AUD">AUD ($) — Australian Dollar</option>
                <option value="CAD">CAD ($) — Canadian Dollar</option>
                <option value="CHF">CHF (Fr) — Swiss Franc</option>
              </select>
            </div>

            {/* Primary Session */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Trading Session</span>
              </label>
              <select
                value={primarySession}
                onChange={(e) => setPrimarySession(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="London">London Session (07:00 – 16:00 UTC)</option>
                <option value="New York">New York Session (12:00 – 21:00 UTC)</option>
                <option value="Overlap">London / NY Overlap (12:00 – 16:00 UTC)</option>
                <option value="Asian">Asian / Tokyo Session (00:00 – 09:00 UTC)</option>
              </select>
            </div>
          </div>

          {/* Trading Bio / Philosophy */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
            <label className="text-xs font-medium text-slate-300 block">
              Trading Philosophy / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Brief summary of your strategy, risk framework, and market approach..."
              rows={3}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg p-3 text-xs text-white focus:outline-none leading-relaxed transition-colors"
            />
            <p className="text-[10px] text-slate-500">
              This summary is displayed on your Trader Profile and exported statements.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
