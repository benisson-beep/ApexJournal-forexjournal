import { NextRequest, NextResponse } from 'next/server';
import { calculatePips, calculateRMultiple } from '../../../../lib/forex-math';
import { Direction, SessionType, Trade } from '../../../../types/trade';

// In-memory store for synced trades across requests
declare global {
  // eslint-disable-next-line no-var
  var __APEX_SYNCED_TRADES__: Trade[] | undefined;
}

if (!global.__APEX_SYNCED_TRADES__) {
  global.__APEX_SYNCED_TRADES__ = [];
}

/**
 * Helper to determine market session from timestamp
 */
function getMarketSession(date: Date): SessionType {
  const utcHour = date.getUTCHours();
  if (utcHour >= 7 && utcHour < 12) return 'London';
  if (utcHour >= 12 && utcHour < 16) return 'Overlap';
  if (utcHour >= 16 && utcHour < 21) return 'New York';
  return 'Asian';
}

/**
 * POST /api/sync/trade
 * Endpoint called by MetaTrader 4 / MetaTrader 5 Expert Advisor
 */
export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key') || request.nextUrl.searchParams.get('api_key');

    // In production, validate apiKey against database/Supabase
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Unauthorized. Missing x-api-key header.' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Required fields from MT4/MT5 EA
    const {
      ticket,
      account_id = 'acc-ftmo-1',
      symbol,
      type, // 'BUY' | 'SELL' or 0 | 1
      lots,
      open_price,
      close_price,
      sl,
      tp,
      commission = 0,
      swap = 0,
      profit = 0,
      open_time,
      close_time,
      comment = '',
    } = body;

    if (!ticket || !symbol || open_price === undefined || close_price === undefined) {
      return NextResponse.json(
        { error: 'Invalid payload. Missing ticket, symbol, open_price, or close_price.' },
        { status: 400 }
      );
    }

    const direction: Direction =
      type === 1 || String(type).toUpperCase() === 'SELL' ? 'SELL' : 'BUY';

    const numOpenPrice = parseFloat(open_price);
    const numClosePrice = parseFloat(close_price);
    const numLots = parseFloat(lots) || 1.0;
    const numSl = sl ? parseFloat(sl) : undefined;
    const numTp = tp ? parseFloat(tp) : undefined;
    const numCommission = parseFloat(commission) || 0;
    const numSwap = parseFloat(swap) || 0;
    const numGrossPnl = parseFloat(profit) || 0;
    const numNetPnl = Number((numGrossPnl + numCommission + numSwap).toFixed(2));

    // Automated Forex calculations
    const pips = calculatePips(symbol, direction, numOpenPrice, numClosePrice);
    const rMultiple = calculateRMultiple(direction, numOpenPrice, numClosePrice, numSl);

    const closeDate = close_time ? new Date(close_time) : new Date();
    const session = getMarketSession(closeDate);

    const syncedTrade: Trade = {
      id: `tr-mt-${ticket}`,
      ticket: String(ticket),
      accountId: account_id,
      symbol: symbol.toUpperCase(),
      direction,
      lotSize: numLots,
      openPrice: numOpenPrice,
      closePrice: numClosePrice,
      stopLoss: numSl,
      takeProfit: numTp,
      pips,
      grossPnl: numGrossPnl,
      commission: numCommission,
      swap: numSwap,
      netPnl: numNetPnl,
      rMultiple,
      status: numNetPnl > 0 ? 'WIN' : numNetPnl < 0 ? 'LOSS' : 'BE',
      openTime: open_time ? new Date(open_time).toISOString() : new Date(Date.now() - 3600000).toISOString(),
      closeTime: closeDate.toISOString(),
      session,
      tags: [
        { id: `tag-mt-auto`, name: 'MT5 Auto-Sync', type: 'CUSTOM' },
        ...(comment ? [{ id: `tag-${Date.now()}`, name: comment, type: 'SETUP' as const }] : []),
      ],
      notes: `Automatically captured from MetaTrader terminal (Ticket #${ticket}).`,
    };

    // Prepend to synced store (avoid duplicates by ticket)
    const existingIndex = (global.__APEX_SYNCED_TRADES__ || []).findIndex(
      (t) => t.ticket === syncedTrade.ticket
    );

    if (existingIndex >= 0 && global.__APEX_SYNCED_TRADES__) {
      global.__APEX_SYNCED_TRADES__[existingIndex] = syncedTrade;
    } else if (global.__APEX_SYNCED_TRADES__) {
      global.__APEX_SYNCED_TRADES__.unshift(syncedTrade);
    }

    return NextResponse.json({
      success: true,
      message: 'Trade synced successfully.',
      trade: syncedTrade,
    });
  } catch (error) {
    console.error('Failed to process trade sync webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error processing trade sync.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/sync/trade
 * Returns recently received trades for the client polling or dashboard sync
 */
export async function GET(request: NextRequest) {
  const accountId = request.nextUrl.searchParams.get('account_id') || 'acc-ftmo-1';
  const trades = (global.__APEX_SYNCED_TRADES__ || []).filter(
    (t) => t.accountId === accountId
  );

  return NextResponse.json({
    success: true,
    count: trades.length,
    trades,
  });
}
