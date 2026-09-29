import { NextRequest, NextResponse } from 'next/server';
import { ForexNewsEvent, NewsCalendarResponse } from '../../../types/trade';

// Global server-side cache across requests to strictly protect Forex Factory rate limits
declare global {
  // eslint-disable-next-line no-var
  var __APEX_FF_NEWS_CACHE__:
    | {
        data: ForexNewsEvent[];
        timestamp: number;
      }
    | undefined;
}

const FOREX_FACTORY_JSON_URL = 'https://nfs.faireconomy.media/ff_calendar_thisweek.json';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache window
const MIN_REFRESH_INTERVAL_MS = 60 * 1000; // Minimum 1 minute between force refreshes

// Fallback high/medium impact calendar data in case upstream is offline or rate-limited on first boot
const FALLBACK_CALENDAR: ForexNewsEvent[] = [
  {
    id: 'ff-fallback-1',
    title: 'Core PCE Price Index m/m',
    country: 'USD',
    date: new Date(Date.now() + 3600000 * 2).toISOString(),
    impact: 'High',
    forecast: '0.3%',
    previous: '0.2%',
  },
  {
    id: 'ff-fallback-2',
    title: 'Non-Farm Employment Change',
    country: 'USD',
    date: new Date(Date.now() + 3600000 * 24).toISOString(),
    impact: 'High',
    forecast: '150K',
    previous: '142K',
  },
  {
    id: 'ff-fallback-3',
    title: 'Unemployment Rate',
    country: 'USD',
    date: new Date(Date.now() + 3600000 * 24).toISOString(),
    impact: 'High',
    forecast: '4.2%',
    previous: '4.3%',
  },
  {
    id: 'ff-fallback-4',
    title: 'ECB Monetary Policy Statement',
    country: 'EUR',
    date: new Date(Date.now() + 3600000 * 10).toISOString(),
    impact: 'High',
    forecast: '3.65%',
    previous: '3.75%',
  },
  {
    id: 'ff-fallback-5',
    title: 'CPI y/y',
    country: 'GBP',
    date: new Date(Date.now() + 3600000 * 14).toISOString(),
    impact: 'High',
    forecast: '2.2%',
    previous: '2.2%',
  },
  {
    id: 'ff-fallback-6',
    title: 'BOJ Policy Rate',
    country: 'JPY',
    date: new Date(Date.now() + 3600000 * 30).toISOString(),
    impact: 'High',
    forecast: '0.25%',
    previous: '0.25%',
  },
];

interface RawForexFactoryItem {
  title?: string;
  country?: string;
  date?: string;
  impact?: string;
  forecast?: string;
  previous?: string;
  actual?: string;
}

/**
 * GET /api/news
 * Returns weekly economic calendar events fetched from forexfactory.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const now = Date.now();

    const existingCache = global.__APEX_FF_NEWS_CACHE__;

    // Check if we can serve from existing cache
    if (existingCache && existingCache.data.length > 0) {
      const age = now - existingCache.timestamp;
      const isFresh = age < CACHE_TTL_MS;
      const isRateLimitedForRefresh = age < MIN_REFRESH_INTERVAL_MS;

      if ((!forceRefresh && isFresh) || (forceRefresh && isRateLimitedForRefresh)) {
        const responsePayload: NewsCalendarResponse = {
          success: true,
          source: 'forexfactory.com',
          lastUpdated: new Date(existingCache.timestamp).toISOString(),
          cached: true,
          events: existingCache.data,
        };
        return NextResponse.json(responsePayload, {
          headers: {
            'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
          },
        });
      }
    }

    // Fetch from Forex Factory Fair Economy feed
    let fetchedData: ForexNewsEvent[] | null = null;
    let fetchError: string | null = null;

    try {
      const res = await fetch(FOREX_FACTORY_JSON_URL, {
        headers: {
          'User-Agent': 'ApexJournal/1.0 (Institutional FX Journal Terminal)',
          Accept: 'application/json',
        },
        // Cache on Next.js fetch layer for 900 seconds
        next: { revalidate: 900 },
      });

      if (!res.ok) {
        throw new Error(`ForexFactory feed returned status ${res.status}: ${res.statusText}`);
      }

      const rawItems: unknown = await res.json();

      if (Array.isArray(rawItems)) {
        fetchedData = (rawItems as RawForexFactoryItem[]).map((item, idx) => ({
          id: `ff-${item.country || 'fx'}-${(item.date || '').replace(/[^0-9]/g, '')}-${idx}`,
          title: String(item.title || 'Market Event').trim(),
          country: String(item.country || 'USD').trim().toUpperCase(),
          date: item.date || new Date().toISOString(),
          impact: (item.impact || 'Low') as 'High' | 'Medium' | 'Low' | 'Holiday',
          forecast: item.forecast ? String(item.forecast).trim() : '',
          previous: item.previous ? String(item.previous).trim() : '',
          actual: item.actual ? String(item.actual).trim() : '',
        }));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Forex Factory fetch error:', message);
      fetchError = message;
    }

    // If fetch succeeded, update cache
    if (fetchedData && fetchedData.length > 0) {
      global.__APEX_FF_NEWS_CACHE__ = {
        data: fetchedData,
        timestamp: now,
      };

      const responsePayload: NewsCalendarResponse = {
        success: true,
        source: 'forexfactory.com',
        lastUpdated: new Date(now).toISOString(),
        cached: false,
        events: fetchedData,
      };

      return NextResponse.json(responsePayload, {
        headers: {
          'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
        },
      });
    }

    // Fallback: If fetch failed but we have stale cache, return it with a note
    if (existingCache && existingCache.data.length > 0) {
      const responsePayload: NewsCalendarResponse = {
        success: true,
        source: 'forexfactory.com (stale cache)',
        lastUpdated: new Date(existingCache.timestamp).toISOString(),
        cached: true,
        events: existingCache.data,
        error: fetchError || undefined,
      };

      return NextResponse.json(responsePayload);
    }

    // Last resort fallback
    const responsePayload: NewsCalendarResponse = {
      success: true,
      source: 'forexfactory.com (offline fallback)',
      lastUpdated: new Date(now).toISOString(),
      cached: true,
      events: FALLBACK_CALENDAR,
      error: fetchError || 'Using default calendar feed',
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Unhandled error in /api/news route:', error);
    return NextResponse.json(
      {
        success: false,
        source: 'forexfactory.com',
        lastUpdated: new Date().toISOString(),
        cached: false,
        events: FALLBACK_CALENDAR,
        error: error?.message || 'Server error',
      },
      { status: 500 }
    );
  }
}
