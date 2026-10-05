'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft, Sun, Moon, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    user,
    isLoading: authLoading,
    signInWithEmail,
    signInWithGoogle,
    resendVerification,
    isGoogleEnabled,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUnconfirmed, setIsUnconfirmed] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [showGoogleGuide, setShowGoogleGuide] = useState(false);

  // Handle query param messages (e.g., from reset password or email confirmation)
  useEffect(() => {
    const msg = searchParams.get('message');
    if (msg) {
      setSuccessMessage(msg);
    }
    const err = searchParams.get('error');
    if (err) {
      setErrorMessage(
        err === 'auth_callback_failed'
          ? 'Authentication callback failed. Please try signing in again.'
          : err
      );
    }
  }, [searchParams]);

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
    setSuccessMessage('');
    setIsUnconfirmed(false);
    setShowGoogleGuide(false);
    setIsLoading(true);

    try {
      const { error } = await signInWithEmail(email, password);

      if (error) {
        if (
          error.message?.toLowerCase().includes('email not confirmed') ||
          (error as any).code === 'email_not_confirmed'
        ) {
          setIsUnconfirmed(true);
          setErrorMessage(
            'Please confirm your email address before signing in. Check your inbox for the verification link.'
          );
        } else if (error.message?.toLowerCase().includes('invalid login credentials')) {
          setErrorMessage('Invalid email or password. Please verify your credentials and try again.');
        } else {
          setErrorMessage(error.message || 'Failed to sign in. Please try again.');
        }
        setIsLoading(false);
        return;
      }

      // Successful sign in
      const redirectTo = searchParams.get('redirectTo') || '/dashboard';
      router.push(redirectTo);
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign in.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    if (!isGoogleEnabled) {
      setShowGoogleGuide(true);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || 'Failed to sign in with Google.');
        setIsLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize Google authentication.');
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
      setSuccessMessage('A fresh confirmation link has been sent to your email.');
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

          {/* Heading */}
          <div>
            <h1
              className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              Sign in to your account
            </h1>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Access your institutional trading journal and MT4/MT5 analytics
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {errorMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              isDarkMode
                ? 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p>{errorMessage}</p>
              {isUnconfirmed && (
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  className="font-semibold underline hover:no-underline text-xs block text-rose-400 hover:text-rose-300 cursor-pointer disabled:opacity-50"
                >
                  {resendStatus === 'sending'
                    ? 'Resending...'
                    : resendStatus === 'sent'
                    ? 'Confirmation email sent!'
                    : 'Resend confirmation email'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Google OAuth Setup Guidance Modal/Notice */}
        {showGoogleGuide && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              isDarkMode
                ? 'bg-blue-500/10 border-blue-500/30 text-slate-200'
                : 'bg-blue-50 border-blue-200 text-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" />
                Google OAuth Setup Required in Supabase
              </span>
              <button
                type="button"
                onClick={() => setShowGoogleGuide(false)}
                className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300">
              Google provider is not enabled yet in your Supabase project. To enable it:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300 pl-1">
              <li>Open your <strong>Supabase Dashboard</strong> &rarr; <strong>Authentication</strong> &rarr; <strong>Providers</strong> &rarr; <strong>Google</strong>.</li>
              <li>Toggle <strong>&quot;Enable Google provider&quot;</strong> and paste your Client ID &amp; Secret.</li>
            </ol>
            <p className="text-[11px] text-amber-300/90 pt-0.5">
              &bull; You can sign in right now using your <strong>Email &amp; Password</strong> below!
            </p>
          </div>
        )}

        {successMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
              isDarkMode
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="flex-1">{successMessage}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
              className={`w-full rounded-xl px-4 py-3 text-sm transition-all outline-none border focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] ${
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label
              className={`flex items-center gap-2 text-xs cursor-pointer select-none ${
                isDarkMode ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className={`w-4 h-4 rounded text-[#2563eb] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#2563eb] cursor-pointer ${
                  isDarkMode
                    ? 'bg-[#0d111a] border-[#1e2638]'
                    : 'bg-white border-slate-300'
                }`}
              />
              <span>Remember me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-xs font-medium text-[#2563eb] hover:text-blue-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
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
              Or continue with
            </span>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || authLoading}
            className={`w-full font-semibold text-xs py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed border relative ${
              isDarkMode
                ? 'bg-[#121622] hover:bg-[#181d2c] border-white/10 hover:border-white/20 text-slate-200'
                : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
            }`}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>Continue with Google</span>
            {!isGoogleEnabled && (
              <span className="text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded font-mono font-normal">
                Setup needed
              </span>
            )}
          </button>
        </form>

        {/* Bottom Signup Link */}
        <div className="text-center pt-2">
          <p
            className={`text-xs ${
              isDarkMode ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            Don't have an account yet?{' '}
            <Link
              href="/register"
              className="text-[#2563eb] hover:text-blue-500 font-semibold transition-colors"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading login portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
