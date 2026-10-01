'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
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

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial session from Supabase
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

    // 2. Listen to real-time auth changes (Sign in, Sign out, Token Refresh, Password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_OUT') {
        // Clear cached profile metadata if needed
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
        return { error, user: null, session: null };
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
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      signOut,
      resetPassword,
      updatePassword,
      resendVerification,
      refreshUser,
    }),
    [user, session, isLoading]
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
