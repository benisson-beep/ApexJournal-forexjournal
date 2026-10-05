'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [statusText, setStatusText] = useState('Finalizing authentication session...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function processAuth() {
      // 1. Check if Supabase sent an error in query params
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      if (errorParam || errorDescription) {
        const fullError = errorDescription || errorParam || 'Authentication failed';
        console.error('Supabase Auth error in callback:', fullError);
        if (isMounted) {
          setErrorMessage(fullError);
        }

        let userFriendlyError = fullError;
        if (fullError.includes('Unable to exchange external code')) {
          userFriendlyError =
            'Google rejected the credentials (Unable to exchange external code). Please verify your Google Client Secret in Supabase, and ensure your email is added under "Test users" in Google Cloud Console OAuth consent screen.';
        }

        setTimeout(() => {
          router.replace(`/login?error=${encodeURIComponent(userFriendlyError)}`);
        }, 3000);
        return;
      }

      // 2. Check for PKCE authorization code in query params (?code=...)
      const code = searchParams.get('code');
      if (code) {
        if (isMounted) {
          setStatusText('Verifying credentials with server...');
        }
        try {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('Error exchanging code for session:', error);
            if (isMounted) {
              setErrorMessage(error.message);
            }
            setTimeout(() => {
              router.replace(`/login?error=${encodeURIComponent(error.message)}`);
            }, 2500);
            return;
          }

          if (data?.session) {
            if (isMounted) {
              setStatusText('Session verified! Redirecting to dashboard...');
            }
            router.replace('/dashboard');
            return;
          }
        } catch (err: any) {
          console.error('Unexpected error exchanging code:', err);
          if (isMounted) {
            setErrorMessage(err.message || 'Failed to exchange authorization code.');
          }
          setTimeout(() => {
            router.replace(`/login?error=${encodeURIComponent(err.message || 'Auth failure')}`);
          }, 2500);
          return;
        }
      }

      // 3. Check if session already exists in client storage
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        if (isMounted) {
          setStatusText('Welcome back! Redirecting to dashboard...');
        }
        router.replace('/dashboard');
        return;
      }

      // 4. Listen to onAuthStateChange (handles hash fragment #access_token=... if used)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        if (session) {
          if (isMounted) {
            setStatusText('Authentication successful! Loading journal...');
          }
          router.replace('/dashboard');
        }
      });

      // 5. Fallback timer if no session is captured
      const timer = setTimeout(() => {
        if (isMounted) {
          router.replace('/login');
        }
      }, 4000);

      return () => {
        subscription.unsubscribe();
        clearTimeout(timer);
      };
    }

    processAuth();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#07090e] flex flex-col items-center justify-center px-4 text-center space-y-4">
      {errorMessage ? (
        <div className="max-w-md p-6 rounded-2xl bg-[#0e121a] border border-rose-500/30 text-rose-300 space-y-3">
          <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
            <AlertCircle className="w-5 h-5" />
          </div>
          <h2 className="text-sm font-bold text-white font-heading">Authentication Failed</h2>
          <p className="text-xs text-rose-300/90 leading-relaxed font-mono text-left bg-black/40 p-3 rounded-lg border border-white/5 break-words">
            {errorMessage}
          </p>
          <p className="text-[11px] text-slate-400">
            Redirecting you back to the sign-in page...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white font-heading">
              Apex<span className="text-red-500">Journal</span> Terminal
            </p>
            <p className="text-xs text-slate-400 font-mono">{statusText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400 text-sm">
          Loading authentication callback...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
