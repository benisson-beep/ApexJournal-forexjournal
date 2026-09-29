'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  ShieldAlert,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import { ForexNewsEvent, NewsCalendarResponse } from '../../types/trade';

interface NewsCalendarViewProps {
  onOpenNewTradeWithContext?: (contextNotes: string) => void;
}

const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];

const CURRENCY_PAIR_HINTS: Record<string, string[]> = {
  USD: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'XAU/USD', 'USD/CAD'],
  EUR: ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'EUR/AUD'],
  GBP: ['GBP/USD', 'EUR/GBP', 'GBP/JPY', 'GBP/AUD'],
  JPY: ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY'],
  AUD: ['AUD/USD', 'AUD/JPY', 'EUR/AUD', 'AUD/CAD'],
  CAD: ['USD/CAD', 'CAD/JPY', 'EUR/CAD'],
  CHF: ['USD/CHF', 'EUR/CHF', 'GBP/CHF'],
  NZD: ['NZD/USD', 'NZD/JPY', 'AUD/NZD'],
  CNY: ['USD/CNH', 'AUD/USD'],
};

export const NewsCalendarView: React.FC<NewsCalendarViewProps> = ({
  onOpenNewTradeWithContext,
}) => {
  const [events, setEvents] = useState<ForexNewsEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isCached, setIsCached] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Filter states
  const [selectedDay, setSelectedDay] = useState<string>('ALL'); // 'ALL' | 'TODAY' | 'TOMORROW' | YYYY-MM-DD
  const [selectedImpacts, setSelectedImpacts] = useState<string[]>(['High', 'Medium', 'Low', 'Holiday']);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Ticking clock for countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch news from /api/news
  const fetchNews = async (force: boolean = false) => {
    if (force) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMsg(null);

    try {
      // Check client localStorage cache if not forced
      if (!force) {
        const localCache = localStorage.getItem('apex_news_cache');
        const localTimestamp = localStorage.getItem('apex_news_timestamp');
        if (localCache && localTimestamp) {
          const age = Date.now() - parseInt(localTimestamp, 10);
          if (age < 15 * 60 * 1000) {
            const parsed = JSON.parse(localCache);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setEvents(parsed);
              setLastUpdated(new Date(parseInt(localTimestamp, 10)).toISOString());
              setIsCached(true);
              setIsLoading(false);
              return;
            }
          }
        }
      }

      const url = force ? '/api/news?refresh=true' : '/api/news';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const data: NewsCalendarResponse = await res.json();

      if (data.events && Array.isArray(data.events)) {
        setEvents(data.events);
        setLastUpdated(data.lastUpdated);
        setIsCached(data.cached);

        try {
          localStorage.setItem('apex_news_cache', JSON.stringify(data.events));
          localStorage.setItem('apex_news_timestamp', String(Date.now()));
        } catch (e) {
          // ignore localStorage quote limits
        }
      } else {
        throw new Error('Invalid data payload from calendar feed');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('Failed to load economic calendar:', message);
      setErrorMsg(message || 'Failed to load economic calendar.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Extract distinct dates from events
  const availableDates = useMemo(() => {
    const map = new Map<string, { dateStr: string; label: string; count: number }>();
    events.forEach((ev) => {
      try {
        const d = new Date(ev.date);
        if (isNaN(d.getTime())) return;
        const key = d.toISOString().split('T')[0];
        if (!map.has(key)) {
          const label = d.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });
          map.set(key, { dateStr: key, label, count: 1 });
        } else {
          map.get(key)!.count += 1;
        }
      } catch {
        // ignore invalid dates
      }
    });
    return Array.from(map.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
  }, [events]);

  const todayStr = useMemo(() => currentTime.toISOString().split('T')[0], [currentTime]);
  const tomorrowStr = useMemo(() => {
    const tm = new Date(currentTime);
    tm.setDate(tm.getDate() + 1);
    return tm.toISOString().split('T')[0];
  }, [currentTime]);

  // High Impact count
  const highImpactCount = useMemo(() => {
    return events.filter((e) => e.impact === 'High').length;
  }, [events]);

  // Next upcoming high impact event
  const nextHighImpactEvent = useMemo(() => {
    const nowMs = currentTime.getTime();
    const upcoming = events
      .filter((e) => e.impact === 'High')
      .map((e) => ({ ...e, eventTimeMs: new Date(e.date).getTime() }))
      .filter((e) => !isNaN(e.eventTimeMs) && e.eventTimeMs > nowMs)
      .sort((a, b) => a.eventTimeMs - b.eventTimeMs);

    return upcoming[0] || null;
  }, [events, currentTime]);

  // Imminent risk event (within 3 hours)
  const imminentRiskEvent = useMemo(() => {
    if (!nextHighImpactEvent) return null;
    const diffMs = new Date(nextHighImpactEvent.date).getTime() - currentTime.getTime();
    if (diffMs > 0 && diffMs <= 4 * 60 * 60 * 1000) {
      return nextHighImpactEvent;
    }
    return null;
  }, [nextHighImpactEvent, currentTime]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // Impact filter
      if (selectedImpacts.length > 0 && !selectedImpacts.includes(ev.impact)) {
        return false;
      }

      // Currency filter
      if (selectedCurrencies.length > 0 && !selectedCurrencies.includes(ev.country)) {
        return false;
      }

      // Day filter
      if (selectedDay !== 'ALL') {
        const evDateStr = ev.date.split('T')[0];
        if (selectedDay === 'TODAY' && evDateStr !== todayStr) return false;
        if (selectedDay === 'TOMORROW' && evDateStr !== tomorrowStr) return false;
        if (selectedDay !== 'TODAY' && selectedDay !== 'TOMORROW' && evDateStr !== selectedDay) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = ev.title.toLowerCase().includes(q);
        const matchesCountry = ev.country.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCountry) return false;
      }

      return true;
    });
  }, [events, selectedImpacts, selectedCurrencies, selectedDay, searchQuery, todayStr, tomorrowStr]);

  // Group filtered events by Day
  const groupedEvents = useMemo(() => {
    const groups: { [dateStr: string]: { label: string; date: Date; items: ForexNewsEvent[] } } = {};

    filteredEvents.forEach((ev) => {
      try {
        const d = new Date(ev.date);
        const dateKey = isNaN(d.getTime()) ? 'Unknown' : d.toISOString().split('T')[0];
        if (!groups[dateKey]) {
          groups[dateKey] = {
            label: isNaN(d.getTime())
              ? 'Other'
              : d.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
            date: d,
            items: [],
          };
        }
        groups[dateKey].items.push(ev);
      } catch {
        // skip
      }
    });

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredEvents]);

  // Helper for relative time countdown
  const getEventTimeStatus = (dateStr: string) => {
    const evTime = new Date(dateStr).getTime();
    if (isNaN(evTime)) return { status: 'passed', label: '—' };

    const diffMs = evTime - currentTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMs < -30 * 60 * 1000) {
      return { status: 'passed', label: 'Completed' };
    }
    if (diffMs < 0) {
      return { status: 'releasing', label: 'Released Just Now' };
    }
    if (diffMin <= 15) {
      return { status: 'imminent', label: `In ${diffMin}m` };
    }
    if (diffHours < 1) {
      return { status: 'soon', label: `In ${diffMin}m` };
    }
    if (diffHours < 24) {
      const remMin = diffMin % 60;
      return { status: 'upcoming', label: `In ${diffHours}h ${remMin}m` };
    }
    const days = Math.floor(diffHours / 24);
    return { status: 'future', label: `In ${days}d` };
  };

  const toggleImpact = (impact: string) => {
    setSelectedImpacts((prev) =>
      prev.includes(impact) ? prev.filter((i) => i !== impact) : [...prev, impact]
    );
  };

  const toggleCurrency = (currency: string) => {
    setSelectedCurrencies((prev) =>
      prev.includes(currency) ? prev.filter((c) => c !== currency) : [...prev, currency]
    );
  };

  // Local Timezone info
  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local';
    }
  }, []);

  return (
    <div className="space-y-6">

      {/* KPI Cards: Weekly Releases Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Events */}
        <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Releases This Week</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{events.length}</span>
            <span className="text-xs text-slate-400">Total events</span>
          </div>
        </div>

        {/* High Impact Alert */}
        <div className="bg-[#131317] border border-rose-500/20 bg-rose-500/[0.02] p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-rose-400 font-medium">
            <span>High Impact Events</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{highImpactCount}</span>
            <span className="text-xs text-slate-400">Red folder releases</span>
          </div>
        </div>

        {/* Next High Impact Countdown */}
        <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next High Impact Event</span>
            </span>
            {nextHighImpactEvent && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold">
                {nextHighImpactEvent.country}
              </span>
            )}
          </div>
          {nextHighImpactEvent ? (
            <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <div className="truncate font-semibold text-sm text-slate-100 max-w-[280px] sm:max-w-none">
                {nextHighImpactEvent.title}
              </div>
              <div className="font-mono text-xs font-semibold text-amber-400 flex items-center gap-1 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                <span>{getEventTimeStatus(nextHighImpactEvent.date).label}</span>
                <span className="text-slate-400 text-[11px] font-normal">
                  ({new Date(nextHighImpactEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-slate-400">No further high-impact events scheduled this week.</div>
          )}
        </div>
      </div>

      {/* Immediate Risk Alert Banner if high impact event is within 4 hours */}
      {imminentRiskEvent && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3.5 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <span>High Volatility Event Approaching</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded font-mono">
                {getEventTimeStatus(imminentRiskEvent.date).label}
              </span>
            </h4>
            <p className="text-xs text-rose-200/90 leading-relaxed">
              <strong>{imminentRiskEvent.country}</strong> {imminentRiskEvent.title} is scheduled at{' '}
              <strong className="underline">
                {new Date(imminentRiskEvent.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </strong>
              . Major spread widening, slippage, and rapid whipsaws expected across{' '}
              <span className="font-mono font-semibold">
                {(CURRENCY_PAIR_HINTS[imminentRiskEvent.country] || [imminentRiskEvent.country]).join(', ')}
              </span>
              . Consider tightening risk or waiting for post-news price action.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl space-y-4">
        {/* Row 1: Search & Quick Presets */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search release (e.g. CPI, Non-Farm, Powell, GDP)..."
              className="w-full bg-[#18181E] border border-white/[0.08] focus:border-blue-500/50 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedImpacts(['High']);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border ${
                selectedImpacts.length === 1 && selectedImpacts[0] === 'High'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                  : 'bg-white/[0.03] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border-white/[0.06]'
              }`}
            >
              🔴 High Impact Only
            </button>

            <button
              onClick={() => {
                setSelectedImpacts(['High', 'Medium', 'Low', 'Holiday']);
                setSelectedCurrencies([]);
                setSelectedDay('ALL');
                setSearchQuery('');
              }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono bg-white/[0.03] px-2.5 py-1.5 rounded-lg border border-white/[0.06]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{userTimezone}</span>
            </div>

            <button
              onClick={() => fetchNews(true)}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-[#18181E] hover:bg-[#202028] disabled:opacity-50 border border-white/[0.08] hover:border-white/[0.15] text-slate-200 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              title="Refresh news from Forex Factory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Row 2: Day Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Day:
          </span>

          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === 'ALL'
                ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            All Week
          </button>

          <button
            onClick={() => setSelectedDay('TODAY')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === 'TODAY'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Today
          </button>

          <button
            onClick={() => setSelectedDay('TOMORROW')}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === 'TOMORROW'
                ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Tomorrow
          </button>

          <div className="h-4 w-px bg-white/[0.08] mx-1 shrink-0" />

          {availableDates.map((item) => (
            <button
              key={item.dateStr}
              onClick={() => setSelectedDay(item.dateStr)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedDay === item.dateStr
                  ? 'bg-white/[0.1] text-white border border-white/[0.15]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              <span>{item.label}</span>
              <span className="ml-1 text-[10px] text-slate-500 font-mono">({item.count})</span>
            </button>
          ))}
        </div>

        {/* Row 3: Impact & Currency Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
          {/* Impact Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Impact:
            </span>

            <button
              onClick={() => toggleImpact('High')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('High')
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>High</span>
            </button>

            <button
              onClick={() => toggleImpact('Medium')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Medium')
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Medium</span>
            </button>

            <button
              onClick={() => toggleImpact('Low')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Low')
                  ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Low</span>
            </button>

            <button
              onClick={() => toggleImpact('Holiday')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Holiday')
                  ? 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Holiday</span>
            </button>
          </div>

          {/* Currency Filter Chips */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Currency:
            </span>
            <button
              onClick={() => setSelectedCurrencies([])}
              className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                selectedCurrencies.length === 0
                  ? 'bg-white/[0.12] text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              ALL
            </button>
            {MAJOR_CURRENCIES.map((cur) => {
              const isSelected = selectedCurrencies.includes(cur);
              return (
                <button
                  key={cur}
                  onClick={() => toggleCurrency(cur)}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold'
                      : 'bg-white/[0.02] text-slate-400 hover:text-slate-200 border-white/[0.04]'
                  }`}
                >
                  {cur}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Calendar Events List */}
      {isLoading ? (
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-12 text-center space-y-3">
          <RefreshCw className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-mono">Fetching Forex Factory calendar feed...</p>
        </div>
      ) : errorMsg && events.length === 0 ? (
        <div className="bg-[#131317] border border-rose-500/20 rounded-xl p-8 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <p className="text-sm font-semibold text-rose-300">{errorMsg}</p>
          <button
            onClick={() => fetchNews(true)}
            className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium cursor-pointer transition-colors"
          >
            Retry Loading Calendar
          </button>
        </div>
      ) : groupedEvents.length === 0 ? (
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-12 text-center space-y-2">
          <Filter className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No economic events match your filters</p>
          <p className="text-xs text-slate-500">Try adjusting your impact level, currency filters, or search term.</p>
          <button
            onClick={() => {
              setSelectedImpacts(['High', 'Medium', 'Low', 'Holiday']);
              setSelectedCurrencies([]);
              setSelectedDay('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 cursor-pointer inline-block"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEvents.map(([dateKey, group]) => {
            const isToday = dateKey === todayStr;
            const isTomorrow = dateKey === tomorrowStr;

            return (
              <div key={dateKey} className="space-y-2">
                {/* Date Header Strip */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#131317]/80 border-b border-white/[0.06] rounded-t-lg sticky top-[57px] z-20 backdrop-blur-md">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-slate-200 tracking-wide font-heading">
                      {group.label}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                        TODAY
                      </span>
                    )}
                    {isTomorrow && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.08] text-slate-300">
                        TOMORROW
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Table of Events for this Day */}
                <div className="bg-[#131317] border border-white/[0.06] rounded-b-xl overflow-hidden divide-y divide-white/[0.04]">
                  {group.items.map((ev, idx) => {
                    const evDate = new Date(ev.date);
                    const timeStr = !isNaN(evDate.getTime())
                      ? evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'All Day';

                    const timeStatus = getEventTimeStatus(ev.date);
                    const isHighImpact = ev.impact === 'High';
                    const isImminent = timeStatus.status === 'imminent' || timeStatus.status === 'releasing';

                    return (
                      <div
                        key={ev.id || `${dateKey}-${idx}`}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-3.5 gap-3 hover:bg-white/[0.02] transition-colors ${
                          isImminent && isHighImpact
                            ? 'bg-rose-500/[0.04] border-l-2 border-l-rose-500'
                            : ''
                        }`}
                      >
                        {/* Left Section: Time, Currency & Impact */}
                        <div className="flex items-center gap-3 shrink-0">
                          {/* Local Time */}
                          <div className="w-16 font-mono text-xs text-slate-300 font-medium">
                            {timeStr}
                          </div>

                          {/* Currency Tag */}
                          <div className="w-12 text-center">
                            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-white/[0.06] text-slate-200 border border-white/[0.08]">
                              {ev.country}
                            </span>
                          </div>

                          {/* Impact Badge */}
                          <div className="w-20">
                            {ev.impact === 'High' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                High
                              </span>
                            )}
                            {ev.impact === 'Medium' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Med
                              </span>
                            )}
                            {ev.impact === 'Low' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                                Low
                              </span>
                            )}
                            {ev.impact === 'Holiday' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                Holiday
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Center Section: Event Title & Impacted Pairs hint */}
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-100 hover:text-white transition-colors">
                              {ev.title}
                            </span>
                            {timeStatus.status === 'imminent' && (
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold animate-pulse">
                                Imminent
                              </span>
                            )}
                          </div>

                          {/* Impacted FX Pairs hint */}
                          {CURRENCY_PAIR_HINTS[ev.country] && (
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                              <span>Pairs:</span>
                              <span>{CURRENCY_PAIR_HINTS[ev.country].slice(0, 4).join(', ')}</span>
                            </div>
                          )}
                        </div>

                        {/* Right Section: Forecast, Previous & Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-white/[0.04]">
                          {/* Economic Data: Forecast & Previous */}
                          <div className="flex items-center gap-4 text-xs font-mono">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase">Forecast</span>
                              <span className="text-slate-300 font-medium">
                                {ev.forecast || '—'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block uppercase">Previous</span>
                              <span className="text-slate-300 font-medium">
                                {ev.previous || '—'}
                              </span>
                            </div>
                          </div>

                          {/* Countdown / Status Badge */}
                          <div className="w-24 text-right">
                            <span
                              className={`text-[10px] font-mono px-2 py-1 rounded inline-block ${
                                timeStatus.status === 'passed'
                                  ? 'text-slate-400 bg-white/[0.02]'
                                  : timeStatus.status === 'imminent'
                                  ? 'bg-rose-500/20 text-rose-300 font-bold'
                                  : 'text-amber-400/90 bg-amber-500/10'
                              }`}
                            >
                              {timeStatus.label}
                            </span>
                          </div>

                          {/* Quick Trade Action */}
                          {onOpenNewTradeWithContext && (
                            <button
                              onClick={() => {
                                onOpenNewTradeWithContext(`Traded around Forex Factory news: ${ev.title} (${ev.country})`);
                              }}
                              className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                              title={`Log trade related to ${ev.title}`}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Attribution & Notice Footer */}
      <div className="p-4 bg-[#131317]/50 border border-white/[0.04] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Data provided by{' '}
            <strong className="text-slate-400">Forex Factory / Fair Economy Media</strong>. Cached locally to avoid rate limits.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Source: nfs.faireconomy.media
        </div>
      </div>
    </div>
  );
};
