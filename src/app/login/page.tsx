'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Frontend demo: simulate authentication then redirect to dashboard
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleGoogleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col justify-center items-center px-4 py-12 selection:bg-blue-600/30 selection:text-blue-200">
      {/* Back to website button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-[420px] mx-auto space-y-8">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <Link href="/" className="inline-flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-base tracking-tighter group-hover:scale-105 transition-transform shadow-lg shadow-emerald-500/10">
              AJ
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-tight text-white font-sans">
                Apex<span className="text-emerald-400">Journal</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-400">®</span>
            </div>
          </Link>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white pt-2">
            Sign in to your account
          </h1>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Address */}
          <div className="space-y-2 text-left">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-200"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#0d111a] border border-[#1e2638] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 transition-all outline-none"
            />
          </div>

          {/* Password */}
          <div className="space-y-2 text-left">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0d111a] border border-[#1e2638] focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] rounded-xl px-4 py-3 pr-11 text-sm text-slate-100 placeholder:text-slate-500 transition-all outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
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
            <label className="flex items-center gap-2.5 text-sm text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0d111a] border border-[#1e2638] text-[#2563eb] focus:ring-0 focus:ring-offset-0 focus:outline-none accent-[#2563eb] cursor-pointer"
              />
              <span>Remember Me</span>
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#2563eb] hover:text-blue-400 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white font-semibold text-sm py-3.5 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign in</span>
            )}
          </button>

          {/* Divider */}
          <div className="py-1 text-center">
            <span className="text-xs font-bold text-slate-400 tracking-wider">OR</span>
          </div>

          {/* Continue with Google Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-[#121622] hover:bg-[#181d2c] border border-white/10 hover:border-white/20 text-slate-200 font-semibold text-sm py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {/* Official Google SVG Icon */}
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
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Bottom Signup Link */}
        <div className="text-center pt-2">
          <p className="text-sm text-slate-300">
            Ready to trade?{' '}
            <Link
              href="/register"
              className="text-[#2563eb] hover:text-blue-400 font-semibold transition-colors"
            >
              Create your account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
