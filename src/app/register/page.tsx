'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Sun, Moon, AlertCircle, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading, signUpWithEmail, signInWithGoogle, resendVerification } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.replace(redirectTo);
    }
  }, [user, authLoading, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);

    try {
      const { error, user: createdUser, session } = await signUpWithEmail(
        email,
        password,
        fullName
      );

      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          setErrorMessage('An account with this email already exists. Please sign in instead.');
        } else {
          setErrorMessage(error.message || 'Failed to create account. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Check if immediate session was returned (email confirmation disabled in Supabase)
      if (session) {
        router.push('/dashboard');
        return;
      }

      // If email confirmation is required by Supabase:
      setIsLoading(false);
      setVerificationPending(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during registration.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Failed to connect with Google.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Google registration.');
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) return;
    setResendStatus('sending');
    const { error } = await resendVerification(email);
    if (error) {
      setErrorMessage(error.message || 'Failed to resend confirmation email.');
      setResendStatus('idle');
    } else {
      setResendStatus('sent');
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
      {/* Back to website button */}
      <Link
        href="/"
        className={`absolute top-6 left-6 flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
          isDarkMode
            ? 'text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border-white/5'
            : 'text-slate-600 hover:text-slate-900 bg-black/5 hover:bg-black/10 border-black/5'
        }`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      {/* Light / Dark Mode Toggle Button */}
      <button
        type="button"
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`absolute top-6 right-6 p-2 rounded-xl transition-colors cursor-pointer ${
          isDarkMode
            ? 'text-slate-400 hover:text-white hover:bg-white/5'
            : 'text-slate-600 hover:text-slate-900 hover:bg-black/5'
        }`}
        title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label="Toggle light or dark theme"
      >
        {isDarkMode ? (
          <Sun className="w-5 h-5 stroke-[2]" />
        ) : (
          <Moon className="w-5 h-5 stroke-[2]" />
        )}
      </button>

      <div className="w-full max-w-[440px] mx-auto space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="inline-flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base tracking-tighter group-hover:scale-105 transition-transform">
              AJ
            </div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-2xl font-black tracking-tight font-sans ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                Apex<span className="text-red-500">Journal</span>
              </span>
              <span
                className={`text-[11px] font-mono font-bold ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                ®
              </span>
            </div>
          </Link>

          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Create your trading account
            </h1>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Start tracking trades, testing setups, and analyzing executions
            </p>
          </div>
        </div>

        {/* Verification Sent Screen */}
        {verificationPending ? (
          <div
            className={`p-6 rounded-2xl border text-center space-y-4 ${
              isDarkMode
                ? 'bg-[#0d111a] border-[#1e2638] text-slate-200'
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mx-auto">
              <Mail className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold">Check your inbox</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                We've sent a verification link to <strong className="text-white font-mono">{email}</strong>.
                Please click the link in the email to activate your account and start journaling.
              </p>
            </div>

            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={handleResendConfirmation}
                disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {resendStatus === 'sending'
                  ? 'Sending...'
                  : resendStatus === 'sent'
                  ? 'Verification Email Sent!'
                  : 'Resend Verification Email'}
              </button>

              <Link
                href="/login"
                className={`block w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-colors ${
                  isDarkMode
                    ? 'border-white/10 hover:border-white/20 text-slate-300 hover:text-white'
                    : 'border-slate-300 hover:border-slate-400 text-slate-700'
                }`}
              >
                Go to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Error Message */}
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

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full / Trader Name */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="fullName"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Trader Name / Handle
                </label>
                <input
                  id="fullName"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
                    isDarkMode
                      ? 'bg-[#0d111a] border-[#1e2638] text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Email Address */}
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
                  className={`w-full rounded-xl px-4 py-2.5 text-sm transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
                    isDarkMode
                      ? 'bg-[#0d111a] border-[#1e2638] text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="password"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Password
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
                    className={`w-full rounded-xl px-4 py-2.5 pr-11 text-sm font-mono transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
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
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="confirmPassword"
                  className={`block text-xs font-semibold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-700'
                  }`}
                >
                  Confirm Password
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
                  placeholder="Repeat your password"
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-mono transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
                    isDarkMode
                      ? 'bg-[#0d111a] border-[#1e2638] text-slate-100 placeholder:text-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label
                  className={`flex items-start gap-2.5 text-xs cursor-pointer select-none ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-600'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className={`w-4 h-4 mt-0.5 rounded text-[#2563eb] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#2563eb] cursor-pointer ${
                      isDarkMode
                        ? 'bg-[#0d111a] border-[#1e2638]'
                        : 'bg-white border-slate-300'
                    }`}
                  />
                  <span>
                    I understand ApexJournal is for trading analytics and does not offer financial advice.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || authLoading}
                className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Create Real Account</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className={`w-full border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`} />
                <span
                  className={`absolute px-3 text-[11px] font-bold uppercase tracking-wider ${
                    isDarkMode ? 'bg-[#07090e] text-slate-400' : 'bg-[#f8fafc] text-slate-500'
                  }`}
                >
                  Or sign up with
                </span>
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading || authLoading}
                className={`w-full font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border ${
                  isDarkMode
                    ? 'bg-[#121622] hover:bg-[#181d2c] border-white/10 hover:border-white/20 text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                }`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Google</span>
              </button>
            </form>

            {/* Bottom Login Link */}
            <div className="text-center pt-2">
              <p
                className={`text-xs ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                Already registered?{' '}
                <Link
                  href="/login"
                  className="text-[#2563eb] hover:text-blue-500 font-semibold transition-colors"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading registration...
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
