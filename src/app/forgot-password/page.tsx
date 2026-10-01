'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function ForgotPasswordForm() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (error) {
        setErrorMessage(error.message || 'Failed to send password reset email.');
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      setSubmitted(true);
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
      {/* Back to sign in button */}
      <Link
        href="/login"
        className={`absolute top-6 left-6 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
          isDarkMode
            ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
            : 'text-slate-600 hover:text-slate-900 bg-black/5 hover:bg-black/10 border-black/5'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Sign In</span>
      </Link>

      {/* Light / Dark Mode Toggle */}
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
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Mail className="w-6 h-6" />
          </div>
          <h1
            className={`text-2xl font-bold tracking-tight ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            Reset your password
          </h1>
          <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Enter your email and we'll send you a secure recovery link
          </p>
        </div>

        {submitted ? (
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
              <h2 className="text-base font-bold">Recovery Link Sent</h2>
              <p className="text-xs text-slate-400">
                If an account exists for <span className="text-white font-mono">{email}</span>, you will receive an email with instructions on how to reset your password.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="block w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors"
              >
                Return to Sign In
              </Link>
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
                  htmlFor="email"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@example.com"
                  className={`w-full rounded-xl px-4 py-3 text-sm transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
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
                  <span>Send Recovery Link</span>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading recovery...
        </div>
      }
    >
      <ForgotPasswordForm />
    </Suspense>
  );
}
