import { createClient } from '@supabase/supabase-js';
import { Trade, TradingAccount, Direction, SessionType, TradeStatus, AccountCategory, AccountStatus } from '../types/trade';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// --- Serializers / Deserializers ---

export const toDbAccount = (account: TradingAccount, userId?: string) => {
  const data: Record<string, any> = {
    id: account.id,
    name: account.name,
    broker: account.broker || '',
    account_number: account.accountNumber || '',
    server: account.server || '',
    currency: account.currency || 'USD',
    initial_balance: account.initialBalance ?? 0,
    current_balance: account.currentBalance ?? 0,
    is_live: Boolean(account.isLive),
    sync_enabled: Boolean(account.syncEnabled),
    account_type: account.accountType || 'PROP_CHALLENGE',
    phase: account.phase || 'Phase 1',
    status: account.status || 'ACTIVE',
  };
  if (userId) {
    data.user_id = userId;
  }
  return data;
};

export const fromDbAccount = (row: any): TradingAccount => ({
  id: row.id,
  name: row.name || 'Trading Account',
  broker: row.broker || '',
  accountNumber: row.account_number || '',
  server: row.server || '',
  currency: row.currency || 'USD',
  initialBalance: Number(row.initial_balance) || 0,
  currentBalance: Number(row.current_balance) || 0,
  isLive: Boolean(row.is_live),
  syncEnabled: Boolean(row.sync_enabled),
  accountType: (row.account_type as AccountCategory) || 'PROP_CHALLENGE',
  phase: row.phase || 'Phase 1',
  status: (row.status as AccountStatus) || 'ACTIVE',
});

export const toDbTrade = (trade: Trade, userId?: string) => {
  const data: Record<string, any> = {
    id: trade.id,
    ticket: trade.ticket || '',
    account_id: trade.accountId && trade.accountId.trim() !== '' ? trade.accountId : null,
    symbol: trade.symbol,
    direction: trade.direction,
    lot_size: trade.lotSize,
    open_price: trade.openPrice,
    close_price: trade.closePrice,
    stop_loss: trade.stopLoss ?? null,
    take_profit: trade.takeProfit ?? null,
    pips: trade.pips ?? 0,
    gross_pnl: trade.grossPnl ?? 0,
    commission: trade.commission ?? 0,
    swap: trade.swap ?? 0,
    net_pnl: trade.netPnl ?? 0,
    r_multiple: trade.rMultiple ?? null,
    status: trade.status,
    open_time: trade.openTime,
    close_time: trade.closeTime,
    session: trade.session || 'New York',
    tags: trade.tags || [],
    notes: trade.notes ?? null,
    chart_url: trade.chartUrl ?? null,
  };
  if (userId) {
    data.user_id = userId;
  }
  return data;
};

export const fromDbTrade = (row: any): Trade => ({
  id: row.id,
  ticket: row.ticket || '',
  accountId: row.account_id || '',
  symbol: row.symbol || 'EURUSD',
  direction: (row.direction as Direction) || 'BUY',
  lotSize: Number(row.lot_size) || 0,
  openPrice: Number(row.open_price) || 0,
  closePrice: Number(row.close_price) || 0,
  stopLoss: row.stop_loss != null ? Number(row.stop_loss) : undefined,
  takeProfit: row.take_profit != null ? Number(row.take_profit) : undefined,
  pips: Number(row.pips) || 0,
  grossPnl: Number(row.gross_pnl) || 0,
  commission: Number(row.commission) || 0,
  swap: Number(row.swap) || 0,
  netPnl: Number(row.net_pnl) || 0,
  rMultiple: row.r_multiple != null ? Number(row.r_multiple) : undefined,
  status: (row.status as TradeStatus) || 'BE',
  openTime: row.open_time || new Date().toISOString(),
  closeTime: row.close_time || new Date().toISOString(),
  session: (row.session as SessionType) || 'New York',
  tags: Array.isArray(row.tags) ? row.tags : [],
  notes: row.notes || undefined,
  chartUrl: row.chart_url || undefined,
});

// Helper to check if error is due to missing column (e.g. user_id before migration)
const isMissingColumnError = (error: any) =>
  error?.code === 'PGRST204' ||
  error?.code === '42703' ||
  error?.message?.includes('schema cache') ||
  error?.message?.includes('does not exist');

// --- Database Operations ---

export async function fetchAccountsFromSupabase(userId?: string): Promise<TradingAccount[]> {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      if (isMissingColumnError(error)) {
        console.warn(
          'Supabase accounts table is missing user_id column or RLS is not configured yet. Returning empty list for safety. Run supabase/schema.sql to enable multi-user data isolation.'
        );
      } else {
        console.error('Error fetching user accounts from Supabase:', error);
      }
      return [];
    }

    return (data || []).map(fromDbAccount);
  } catch (err) {
    console.error('Unexpected error fetching accounts from Supabase:', err);
    return [];
  }
}

export async function fetchTradesFromSupabase(userId?: string): Promise<Trade[]> {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('close_time', { ascending: false });

    if (error) {
      if (isMissingColumnError(error)) {
        console.warn(
          'Supabase trades table is missing user_id column or RLS is not configured yet. Returning empty list for safety. Run supabase/schema.sql to enable multi-user data isolation.'
        );
      } else {
        console.error('Error fetching user trades from Supabase:', error);
      }
      return [];
    }

    return (data || []).map(fromDbTrade);
  } catch (err) {
    console.error('Unexpected error fetching trades from Supabase:', err);
    return [];
  }
}

export async function saveAccountToSupabase(account: TradingAccount, userId?: string): Promise<boolean> {
  if (!userId) {
    console.warn('Cannot save account without authenticated userId');
    return false;
  }

  try {
    const { error } = await supabase.from('accounts').upsert(toDbAccount(account, userId));
    if (error) {
      if (isMissingColumnError(error)) {
        console.warn(
          'Supabase accounts table is missing user_id column. Run supabase/schema.sql in your Supabase SQL Editor.'
        );
      } else {
        console.error('Error saving account to Supabase:', error);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error saving account to Supabase:', err);
    return false;
  }
}

export async function deleteAccountFromSupabase(accountId: string, userId?: string): Promise<boolean> {
  try {
    let query = supabase.from('accounts').delete().eq('id', accountId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.error('Error deleting account from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error deleting account from Supabase:', err);
    return false;
  }
}

export async function saveTradeToSupabase(trade: Trade, userId?: string): Promise<boolean> {
  if (!userId) {
    console.warn('Cannot save trade without authenticated userId');
    return false;
  }

  try {
    const { error } = await supabase.from('trades').upsert(toDbTrade(trade, userId));
    if (error) {
      if (isMissingColumnError(error)) {
        console.warn(
          'Supabase trades table is missing user_id column. Run supabase/schema.sql in your Supabase SQL Editor.'
        );
      } else {
        console.error('Error saving trade to Supabase:', error);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error saving trade to Supabase:', err);
    return false;
  }
}

export async function saveTradesBatchToSupabase(trades: Trade[], userId?: string): Promise<boolean> {
  if (!userId || trades.length === 0) return true;
  try {
    const rows = trades.map((t) => toDbTrade(t, userId));
    const { error } = await supabase.from('trades').upsert(rows);
    if (error) {
      if (isMissingColumnError(error)) {
        console.warn(
          'Supabase trades table is missing user_id column. Run supabase/schema.sql in your Supabase SQL Editor.'
        );
      } else {
        console.error('Error batch saving trades to Supabase:', error);
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error batch saving trades to Supabase:', err);
    return false;
  }
}

export async function deleteTradeFromSupabase(tradeId: string, userId?: string): Promise<boolean> {
  try {
    let query = supabase.from('trades').delete().eq('id', tradeId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) {
      console.error('Error deleting trade from Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error deleting trade from Supabase:', err);
    return false;
  }
}

export async function updateAccountBalanceInSupabase(
  accountId: string,
  newBalance: number,
  userId?: string
): Promise<boolean> {
  try {
    let query = supabase
      .from('accounts')
      .update({ current_balance: newBalance })
      .eq('id', accountId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) {
      console.error('Error updating account balance in Supabase:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Unexpected error updating account balance in Supabase:', err);
    return false;
  }
}
