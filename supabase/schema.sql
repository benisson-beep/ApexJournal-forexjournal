-- =========================================================================
-- ApexJournal Supabase Schema Migration: Multi-User Authentication & RLS
-- =========================================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
--
-- This script:
-- 1. Adds user_id foreign key references to auth.users for accounts and trades.
-- 2. Enables Row Level Security (RLS) on accounts and trades.
-- 3. Creates strict security policies ensuring every user can only view,
--    insert, update, and delete their own trading accounts and trades.
-- =========================================================================

-- 1. Add user_id column to accounts
ALTER TABLE public.accounts 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on accounts.user_id for fast user querying
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts(user_id);

-- 2. Add user_id column to trades
ALTER TABLE public.trades 
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on trades.user_id for fast user querying
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON public.trades(user_id);

-- 3. Enable Row-Level Security
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

-- 4. Accounts Table RLS Policies
DROP POLICY IF EXISTS "Users can only view their own accounts" ON public.accounts;
CREATE POLICY "Users can only view their own accounts"
  ON public.accounts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own accounts" ON public.accounts;
CREATE POLICY "Users can insert their own accounts"
  ON public.accounts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
CREATE POLICY "Users can update their own accounts"
  ON public.accounts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own accounts" ON public.accounts;
CREATE POLICY "Users can delete their own accounts"
  ON public.accounts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Trades Table RLS Policies
DROP POLICY IF EXISTS "Users can only view their own trades" ON public.trades;
CREATE POLICY "Users can only view their own trades"
  ON public.trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own trades" ON public.trades;
CREATE POLICY "Users can insert their own trades"
  ON public.trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own trades" ON public.trades;
CREATE POLICY "Users can update their own trades"
  ON public.trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own trades" ON public.trades;
CREATE POLICY "Users can delete their own trades"
  ON public.trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
