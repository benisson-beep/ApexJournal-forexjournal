import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/dashboard';

  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Error exchanging code for session:', error);
    } catch (err) {
      console.error('Unexpected error in auth callback:', err);
    }
  }

  // Redirect to dashboard or login
  return NextResponse.redirect(`${origin}/dashboard`);
}
