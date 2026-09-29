'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Camera,
  Upload,
  Trash2,
  Briefcase,
  Award,
  Clock,
  Globe,
  Coins,
  Save,
  Check,
  Compass,
  Sparkles,
} from 'lucide-react';
import { Trade, TradingAccount, AccountStats } from '../../types/trade';

interface ProfileViewProps {
  account?: TradingAccount | null;
  trades?: Trade[];
  stats?: AccountStats;
}

const AVATAR_PRESETS = [
  { id: 'tactical-blue', name: 'Tactical Blue', gradient: 'from-blue-600 to-indigo-700', text: 'text-blue-300' },
  { id: 'terminal-emerald', name: 'Terminal Emerald', gradient: 'from-emerald-600 to-teal-800', text: 'text-emerald-300' },
  { id: 'macro-violet', name: 'Macro Violet', gradient: 'from-purple-600 to-violet-900', text: 'text-purple-300' },
  { id: 'cyber-amber', name: 'Cyber Amber', gradient: 'from-amber-600 to-orange-800', text: 'text-amber-300' },
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time', offset: 'UTC+00:00' },
  { value: 'America/New_York', label: 'America / New York (EST / EDT)', offset: 'UTC-05:00' },
  { value: 'Europe/London', label: 'Europe / London (GMT / BST)', offset: 'UTC+00:00' },
  { value: 'Europe/Frankfurt', label: 'Europe / Frankfurt (CET / CEST)', offset: 'UTC+01:00' },
  { value: 'Asia/Tokyo', label: 'Asia / Tokyo (JST)', offset: 'UTC+09:00' },
  { value: 'Asia/Singapore', label: 'Asia / Singapore (SGT)', offset: 'UTC+08:00' },
  { value: 'Asia/Dubai', label: 'Asia / Dubai (GST)', offset: 'UTC+04:00' },
  { value: 'Australia/Sydney', label: 'Australia / Sydney (AEST / AEDT)', offset: 'UTC+10:00' },
  { value: 'America/Chicago', label: 'America / Chicago (CST / CDT)', offset: 'UTC-06:00' },
  { value: 'America/Los_Angeles', label: 'America / Los Angeles (PST / PDT)', offset: 'UTC-08:00' },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AUD', symbol: '$', name: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'CAD', symbol: '$', name: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: '🇨🇭' },
  { code: 'NZD', symbol: '$', name: 'New Zealand Dollar', flag: '🇳🇿' },
];

export const ProfileView: React.FC<ProfileViewProps> = () => {
  // 1. Personal Information State
  const [traderName, setTraderName] = useState('Trader');
  const [email, setEmail] = useState('trader@apexjournal.io');
  const [bio, setBio] = useState(
    'Discretionary trader focused on liquidity sweeps, session momentum, and strict risk execution.'
  );

  // 2. Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('tactical-blue');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Trading Profile State
  const [tradingStyle, setTradingStyle] = useState('Discretionary Day Trader');
  const [experience, setExperience] = useState('Advanced / Funded (3+ years)');
  const [primarySession, setPrimarySession] = useState('New York');
  const [strategyEdge, setStrategyEdge] = useState('ICT / Liquidity Sweeps & Order Blocks');

  // 4. Timezone State
  const [timezone, setTimezone] = useState('America/New_York');
  const [currentTimeInZone, setCurrentTimeInZone] = useState('');

  // 5. Currency State
  const [currency, setCurrency] = useState('USD');

  // UI state
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedName = localStorage.getItem('apex_profile_name');
      if (savedName) setTraderName(savedName);

      const savedEmail = localStorage.getItem('apex_profile_email');
      if (savedEmail) setEmail(savedEmail);

      const savedBio = localStorage.getItem('apex_profile_bio');
      if (savedBio) setBio(savedBio);

      const savedAvatar = localStorage.getItem('apex_profile_avatar');
      if (savedAvatar) setAvatarUrl(savedAvatar);

      const savedPreset = localStorage.getItem('apex_profile_avatar_preset');
      if (savedPreset) setSelectedPreset(savedPreset);

      const savedStyle = localStorage.getItem('apex_profile_style');
      if (savedStyle) setTradingStyle(savedStyle);

      const savedExp = localStorage.getItem('apex_profile_experience');
      if (savedExp) setExperience(savedExp);

      const savedSession = localStorage.getItem('apex_profile_session');
      if (savedSession) setPrimarySession(savedSession);

      const savedStrategy = localStorage.getItem('apex_profile_strategy');
      if (savedStrategy) setStrategyEdge(savedStrategy);

      const savedTimezone = localStorage.getItem('apex_profile_timezone');
      if (savedTimezone) setTimezone(savedTimezone);

      const savedCurrency = localStorage.getItem('apex_profile_currency');
      if (savedCurrency) setCurrency(savedCurrency);
    } catch (e) {
      console.error('Error loading profile from localStorage', e);
    }
  }, []);

  // Live Clock in Selected Timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const formatted = new Intl.DateTimeFormat('en-US', {
          timeZone: timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date());
        setCurrentTimeInZone(formatted);
      } catch (err) {
        setCurrentTimeInZone(new Date().toLocaleTimeString());
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezone]);

  // Handle Avatar Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Save All Changes to localStorage
  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('apex_profile_name', traderName);
        localStorage.setItem('apex_profile_email', email);
        localStorage.setItem('apex_profile_bio', bio);
        localStorage.setItem('apex_profile_avatar', avatarUrl);
        localStorage.setItem('apex_profile_avatar_preset', selectedPreset);
        localStorage.setItem('apex_profile_style', tradingStyle);
        localStorage.setItem('apex_profile_experience', experience);
        localStorage.setItem('apex_profile_session', primarySession);
        localStorage.setItem('apex_profile_strategy', strategyEdge);
        localStorage.setItem('apex_profile_timezone', timezone);
        localStorage.setItem('apex_profile_currency', currency);

        window.dispatchEvent(new Event('apex_profile_updated'));
      } catch (err) {
        console.error('Failed to save profile', err);
      }
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Generate Initials
  const initials =
    traderName
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TR';

  const activePreset =
    AVATAR_PRESETS.find((p) => p.id === selectedPreset) || AVATAR_PRESETS[0];

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Top Header & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-heading">
            Trader Profile
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure your personal identity, avatar, trading framework, timezone, and account currency
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
        >
          {savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </>
          )}
        </button>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* ========================================================
            1. AVATAR SECTION
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
                Avatar
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Identity & Visual Badge
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar Preview */}
            <div className="relative group shrink-0">
              <div
                className={`w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/[0.12] flex items-center justify-center shadow-lg ${
                  avatarUrl
                    ? 'bg-black'
                    : `bg-gradient-to-br ${activePreset.gradient}`
                }`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={traderName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold font-heading text-white tracking-wider">
                    {initials}
                  </span>
                )}
              </div>

              {/* Upload shortcut on preview */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center gap-1 text-white text-[10px] font-medium cursor-pointer"
                title="Change image"
              >
                <Upload className="w-4 h-4" />
                <span>Upload</span>
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-4 flex-1 w-full text-center sm:text-left">
              <div>
                <h4 className="text-sm font-semibold text-white font-heading">
                  Profile Photo & Badge
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload a custom image or choose a signature institutional preset theme.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-medium text-slate-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-400" />
                  <span>Upload Photo</span>
                </button>

                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-xs font-medium text-rose-300 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Photo</span>
                  </button>
                )}
              </div>

              {/* Preset Color Themes */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  <span>Preset Themes (used when no photo is uploaded)</span>
                </label>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  {AVATAR_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setSelectedPreset(preset.id)}
                      className={`flex items-center gap-2 px-2.5 py-1 rounded-md text-xs border transition-all cursor-pointer ${
                        selectedPreset === preset.id
                          ? 'bg-white/[0.08] border-blue-500/60 text-white'
                          : 'bg-[#0D0D0F] border-white/[0.06] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-gradient-to-br ${preset.gradient}`}
                      />
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            2. PERSONAL INFORMATION SECTION
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
                Personal Information
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Public Identity & Contact
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name / Handle */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Trader Name / Handle</span>
              </label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                placeholder="e.g. ApexTrader / Alex M."
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
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
                placeholder="trader@apexjournal.io"
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Bio / Philosophy */}
          <div className="space-y-1.5 pt-1">
            <label className="text-xs font-medium text-slate-300 block">
              Trading Philosophy / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="State your trading principles, risk tolerance, and operational philosophy..."
              rows={3}
              className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none leading-relaxed transition-colors"
            />
            <p className="text-[10px] text-slate-500">
              Summarizes your trading mentality and methodology across reports.
            </p>
          </div>
        </div>

        {/* ========================================================
            3. TRADING PROFILE SECTION
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
                Trading Profile
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Style, Experience & Edge
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Primary Trading Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Trading Style</span>
              </label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Scalper">Scalper (1m – 5m rapid execution)</option>
                <option value="Discretionary Day Trader">Discretionary Day Trader (15m – 1h session momentum)</option>
                <option value="Swing Trader">Swing Trader (4h – Daily market cycles)</option>
                <option value="Position Trader">Position Trader (Weekly / Macro multi-month hold)</option>
                <option value="Algorithmic / Quantitative">Algorithmic / Quantitative Trader</option>
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
                <option value="Foundation / Novice (< 1 year)">Foundation / Novice (&lt; 1 year)</option>
                <option value="Developing Trader (1 - 3 years)">Developing Trader (1 – 3 years)</option>
                <option value="Advanced / Funded (3+ years)">Advanced / Funded Trader (3 – 5 years)</option>
                <option value="Institutional / Professional (5+ years)">Institutional / Professional (5+ years)</option>
              </select>
            </div>

            {/* Primary Trading Session */}
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

            {/* Core Strategy / Edge */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>Core Strategy / Setup Edge</span>
              </label>
              <select
                value={strategyEdge}
                onChange={(e) => setStrategyEdge(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="ICT / Liquidity Sweeps & Order Blocks">ICT / Liquidity Sweeps & Order Blocks</option>
                <option value="Price Action & Support/Resistance">Price Action & Support/Resistance Reversals</option>
                <option value="Breakout & Session Volume Expansion">Breakout & Session Volume Expansion</option>
                <option value="Trend Following & Moving Average Pullbacks">Trend Following & Moving Average Pullbacks</option>
                <option value="Mean Reversion & Volatility Bands">Mean Reversion & Volatility Bands</option>
                <option value="Supply & Demand Imbalances">Supply & Demand Imbalances</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================
            4. TIMEZONE SECTION
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
                Timezone
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Session Timing & Chart Alignment
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            {/* Timezone Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Operational Timezone</span>
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>

            {/* Live Clock Preview Card */}
            <div className="bg-[#0D0D0F] border border-white/[0.06] rounded-lg p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Local Time
                </span>
                <p className="text-base font-mono font-bold text-white mt-0.5 tabular-nums">
                  {currentTimeInZone || '—:—:—'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-500 block">
                  Active Hub
                </span>
                <span className="text-xs font-mono font-medium text-blue-400">
                  {TIMEZONES.find((t) => t.value === timezone)?.offset || 'UTC'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            5. CURRENCY SECTION
           ======================================================== */}
        <div className="bg-[#131317] border border-white/[0.07] rounded-xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
                Currency
              </h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Base Account Denomination
            </span>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-medium text-slate-300 block">
              Preferred Base Currency
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {CURRENCIES.map((curr) => {
                const isSelected = currency === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setCurrency(curr.code)}
                    className={`flex items-center justify-between p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/10 border-blue-500/50 text-white shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-[#0D0D0F] border-white/[0.06] text-slate-300 hover:border-white/[0.12] hover:bg-white/[0.02]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{curr.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold font-mono text-white leading-tight">
                          {curr.code}
                        </p>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          {curr.name}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-400">
                      {curr.symbol}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500">
              This sets the primary monetary unit for your account balance, risk calculations, P&amp;L displays, and performance exports.
            </p>
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Profile Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save All Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
