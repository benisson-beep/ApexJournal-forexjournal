'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isGoogleEnabled: boolean;
  isMailerAutoconfirm: boolean;
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUpWithEmail: (
    email: string,
    password: string,
    fullName?: string
  ) => Promise<{ error: AuthError | null; user: User | null; session: Session | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendVerification: (email: string) => Promise<{ error: AuthError | null }>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGoogleEnabled, setIsGoogleEnabled] = useState<boolean>(false);
  const [isMailerAutoconfirm, setIsMailerAutoconfirm] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch Supabase auth provider settings
    async function checkAuthSettings() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseKey =
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
          '';
        if (!supabaseUrl) return;

        const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: supabaseKey },
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setIsGoogleEnabled(Boolean(data?.external?.google));
            setIsMailerAutoconfirm(Boolean(data?.mailer_autoconfirm));
          }
        }
      } catch (err) {
        console.warn('Could not fetch Supabase auth provider settings:', err);
      }
    }

    checkAuthSettings();

    // 2. Fetch initial session from Supabase
    async function getInitialSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error fetching Supabase session:', error);
        }
        if (isMounted) {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Unexpected error fetching session:', err);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    getInitialSession();

    // 3. Listen to real-time auth changes (Sign in, Sign out, Token Refresh, Password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem('apex_current_user_email');
        } catch {
          // Ignore storage errors
        }
      } else if (newSession?.user) {
        try {
          localStorage.setItem('apex_current_user_email', newSession.user.email || '');
        } catch {
          // Ignore storage errors
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      setSession(data.session);
      setUser(data.user);
      setIsLoading(false);
      return { error: null };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err as AuthError };
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string) => {
    setIsLoading(true);
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || '',
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setIsLoading(false);
        let userMessage = error.message;

        if (
          error.message?.toLowerCase().includes('rate limit') ||
          (error as any).status === 429
        ) {
          userMessage =
            "Supabase free email rate limit exceeded (3 emails/hour). In your Supabase dashboard, go to Authentication > Providers > Email and turn OFF 'Confirm email' to allow instant, unlimited signups.";
        }

        error.message = userMessage;
        return {
          error,
          user: null,
          session: null,
        };
      }

      setSession(data.session);
      setUser(data.user);
      setIsLoading(false);
      return { error: null, user: data.user, session: data.session };
    } catch (err: any) {
      setIsLoading(false);
      return { error: err as AuthError, user: null, session: null };
    }
  };

  const signInWithGoogle = async () => {
    // Graceful check: Prevent raw 400 error page if Google provider isn't enabled in Supabase
    if (!isGoogleEnabled) {
      return {
        error: {
          name: 'ProviderNotEnabled',
          message:
            'Google Sign-In is not enabled yet in your Supabase project. To enable it, open your Supabase Dashboard > Authentication > Providers > Google and configure your Google OAuth credentials, or sign in with Email & Password below.',
        } as AuthError,
      };
    }

    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (
        error &&
        (error.message?.toLowerCase().includes('rate limit') || (error as any).status === 429)
      ) {
        error.message =
          'Email rate limit reached for the hour. Please wait a short while or configure custom SMTP in Supabase.';
        return {
          error,
        };
      }

      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const resendVerification = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      return { error };
    } catch (err: any) {
      return { error: err as AuthError };
    }
  };

  const refreshUser = async () => {
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isLoading,
      isGoogleEnabled,
      isMailerAutoconfirm,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      resendVerification,
      refreshUser,
    }),
    [user, session, isLoading, isGoogleEnabled, isMailerAutoconfirm]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
