'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, KeyRound, LogOut, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Trade, TradingAccount, AccountStats } from '../../types/trade';

interface ProfileViewProps {
  account?: TradingAccount | null;
  trades?: Trade[];
  stats?: AccountStats;
}

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
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: '$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: '$' },
];

const normalizeStyle = (val: string): string => {
  if (!val) return 'Day Trader';
  if (val.includes('Scalper')) return 'Scalper';
  if (val.includes('Swing')) return 'Swing Trader';
  if (val.includes('Position')) return 'Position Trader';
  if (val.includes('Algo')) return 'Algorithmic';
  if (val.includes('Day')) return 'Day Trader';
  return val;
};

const normalizeExperience = (val: string): string => {
  if (!val) return 'Developing';
  const lower = val.toLowerCase();
  if (lower.includes('novice') || lower.includes('foundation') || lower.includes('beginner')) return 'Beginner';
  if (lower.includes('developing')) return 'Developing';
  if (lower.includes('advanced') || lower.includes('funded')) return 'Advanced';
  if (lower.includes('institutional') || lower.includes('professional')) return 'Professional';
  return val;
};

const normalizeSession = (val: string): string => {
  if (!val) return 'New York';
  if (val === 'Overlap' || val.includes('Overlap')) return 'London-NY Overlap';
  if (val.includes('London')) return 'London';
  if (val.includes('New York')) return 'New York';
  if (val.includes('Asian') || val.includes('Tokyo')) return 'Asian';
  return val;
};

export const ProfileView: React.FC<ProfileViewProps> = () => {
  const { user, updatePassword, signOut } = useAuth();

  // 1. Personal Information State
  const [traderName, setTraderName] = useState(
    user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Trader'
  );
  const [email, setEmail] = useState(user?.email || 'trader@apexjournal.io');
  const [bio, setBio] = useState('');

  // Password Update State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // 2. Avatar State
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('tactical-blue');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 3. Trading Preferences State
  const [tradingStyle, setTradingStyle] = useState('Day Trader');
  const [experience, setExperience] = useState('Developing');
  const [primarySession, setPrimarySession] = useState('New York');
  const [strategyEdge, setStrategyEdge] = useState('');

  // 4. Timezone State
  const [timezone, setTimezone] = useState('America/New_York');

  // 5. Currency State
  const [currency, setCurrency] = useState('USD');

  // UI status
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sync with authenticated user
  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.user_metadata?.full_name && !localStorage.getItem('apex_profile_name')) {
      setTraderName(user.user_metadata.full_name);
    }
  }, [user]);

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
      if (savedStyle) setTradingStyle(normalizeStyle(savedStyle));

      const savedExp = localStorage.getItem('apex_profile_experience');
      if (savedExp) setExperience(normalizeExperience(savedExp));

      const savedSession = localStorage.getItem('apex_profile_session');
      if (savedSession) setPrimarySession(normalizeSession(savedSession));

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
    setIsSaving(true);
    setErrorMessage('');

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('apex_profile_name', traderName);
        localStorage.setItem('apex_profile_email', email);
        if (bio) localStorage.setItem('apex_profile_bio', bio);
        localStorage.setItem('apex_profile_avatar', avatarUrl);
        if (selectedPreset) localStorage.setItem('apex_profile_avatar_preset', selectedPreset);
        localStorage.setItem('apex_profile_style', tradingStyle);
        localStorage.setItem('apex_profile_experience', experience);
        localStorage.setItem('apex_profile_session', primarySession);
        if (strategyEdge) localStorage.setItem('apex_profile_strategy', strategyEdge);
        localStorage.setItem('apex_profile_timezone', timezone);
        localStorage.setItem('apex_profile_currency', currency);

        window.dispatchEvent(new Event('apex_profile_updated'));
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2500);
      } catch (err) {
        console.error('Failed to save profile', err);
        setErrorMessage('Unable to save changes. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      setPasswordError(error.message || 'Failed to update password.');
      setPasswordLoading(false);
    } else {
      setPasswordSuccess(true);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordLoading(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  // Generate Initials
  const initials =
    traderName
      .trim()
      .split(/\s+/)
      .map((w: string) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'TR';

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* 1. Profile Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white font-heading">
          PROFILE
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your personal information and basic trading preferences.
        </p>
      </div>

      {/* 2. Top Identity Block */}
      <div className="flex items-center gap-4 py-1">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/[0.12] bg-[#16161c] flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={traderName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-base font-bold font-heading text-white tracking-wider">
              {initials}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate font-heading">
            {traderName || 'Trader'}
          </h2>
          <p className="text-xs text-slate-400 truncate">
            {email || 'No email provided'}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
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
              className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
            >
              Change Photo
            </button>
            {avatarUrl && (
              <>
                <span className="text-slate-600 text-xs">•</span>
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="text-xs font-medium text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* 3. Personal Information */}
        <div className="pt-6 border-t border-white/[0.06] space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
            Personal Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Trader Name / Handle
              </label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                placeholder="e.g. Alex M."
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@apexjournal.io"
                required
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* 4. Trading Preferences */}
        <div className="pt-6 border-t border-white/[0.06] space-y-4">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
            Trading Preferences
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Trading Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Trading Style
              </label>
              <select
                value={tradingStyle}
                onChange={(e) => setTradingStyle(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Scalper">Scalper</option>
                <option value="Day Trader">Day Trader</option>
                <option value="Swing Trader">Swing Trader</option>
                <option value="Position Trader">Position Trader</option>
                <option value="Algorithmic">Algorithmic</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="Beginner">Beginner</option>
                <option value="Developing">Developing</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            {/* Primary Trading Session */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Primary Trading Session
              </label>
              <select
                value={primarySession}
                onChange={(e) => setPrimarySession(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                <option value="London">London</option>
                <option value="New York">New York</option>
                <option value="London-NY Overlap">London-NY Overlap</option>
                <option value="Asian">Asian</option>
              </select>
            </div>

            {/* Operational Timezone */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 block">
                Operational Timezone
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

            {/* Preferred Base Currency */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-medium text-slate-300 block">
                Preferred Base Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer transition-colors"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.name} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 5. Save Action */}
        <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between sm:justify-end gap-3">
          {errorMessage && (
            <span className="text-xs text-rose-400 font-medium">
              {errorMessage}
            </span>
          )}

          {savedSuccess && (
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              Changes saved
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-50 text-white font-medium text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm ml-auto"
          >
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>

      {/* 6. Security & Password Change */}
      <div className="pt-8 border-t border-white/[0.06] space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-heading">
            Security & Authentication
          </h3>
        </div>

        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-4 space-y-4">
          <div>
            <span className="text-xs font-medium text-slate-200 block">Change Account Password</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Update the password associated with your real trading account ({email}).
            </span>
          </div>

          {passwordError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Password updated successfully!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 block">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                minLength={6}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-400 block">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                minLength={6}
                className="w-full bg-[#0D0D0F] border border-white/[0.08] focus:border-blue-500/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={passwordLoading || !newPassword}
              className="flex items-center gap-1.5 bg-[#18181E] hover:bg-[#202028] border border-white/[0.08] hover:border-white/[0.15] text-slate-200 disabled:opacity-50 text-xs font-medium px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-400" />
              <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 7. Session Sign Out Card */}
      <div className="pt-6 border-t border-white/[0.06] flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-200 block font-heading">
            Session Management
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Securely sign out of this browser terminal session.
          </span>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
