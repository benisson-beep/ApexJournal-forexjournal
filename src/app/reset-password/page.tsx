'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword, user, isLoading: authLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);
      if (error) {
        setErrorMessage(error.message || 'Failed to update password.');
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setIsLoading(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-200 relative ${
        isDarkMode
          ? 'bg-[#07090e] text-slate-100 selection:bg-blue-600/30 selection:text-blue-200'
          : 'bg-[#f8fafc] text-slate-900 selection:bg-blue-500/20 selection:text-blue-700'
      }`}
    >
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2 rounded-xl transition-colors cursor-pointer ${
          isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
        }`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="w-full max-w-[420px] mx-auto space-y-6">
        <div className="flex flex-col items-center justify-center space-y-3 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Lock className="w-6 h-6" />
          </div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Set new password
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Please enter your new trading account password
          </p>
        </div>

        {success ? (
          <div
            className={`p-6 rounded-2xl border text-center space-y-4 ${
              isDarkMode
                ? 'bg-[#0d111a] border-[#1e2638] text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="flex justify-center text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold">Password Updated!</h2>
              <p className="text-xs text-slate-400">
                Your password has been changed successfully. Redirecting you to your journal terminal...
              </p>
            </div>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                  isDarkMode
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                    : 'bg-rose-50 border-rose-200 text-rose-700'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <p className="flex-1">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="password"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={`w-full rounded-xl px-4 py-3 pr-11 text-sm font-mono transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
                      isDarkMode
                        ? 'bg-[#0d111a] border-[#1e2638] text-slate-100 placeholder:text-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 transition-colors cursor-pointer ${
                      isDarkMode
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className={`w-full rounded-xl px-4 py-3 text-sm font-mono transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
                    isDarkMode
                      ? 'bg-[#0d111a] border-[#1e2638] text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading password reset...
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
