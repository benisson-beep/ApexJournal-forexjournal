'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  Plus,
  Sparkles,
  Info,
  Folder,
  ChevronDown,
  ChevronUp,
  History,
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

/**
 * Forex Factory Signature Impact Folder Icon
 * Red = High Impact
 * Orange = Medium Impact
 * Yellow = Low Impact
 * Gray = Non-Economic / Holiday
 */
export const ImpactFolder: React.FC<{
  impact: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}> = ({ impact, size = 'md', showLabel = false }) => {
  const norm = (impact || '').toLowerCase();

  let folderColor = 'fill-slate-500 text-slate-400';
  let labelText = 'Holiday';
  let labelColor = 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  let title = 'Non-Economic / Holiday';

  if (norm.includes('high') || norm === 'red') {
    folderColor = 'fill-red-600 text-red-500';
    labelText = 'High';
    labelColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    title = 'High Impact (Red Folder)';
  } else if (norm.includes('medium') || norm.includes('med') || norm === 'orange') {
    folderColor = 'fill-orange-500 text-orange-400';
    labelText = 'Medium';
    labelColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    title = 'Medium Impact (Orange Folder)';
  } else if (norm.includes('low') || norm === 'yellow') {
    folderColor = 'fill-amber-400 text-amber-300';
    labelText = 'Low';
    labelColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    title = 'Low Impact (Yellow Folder)';
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="inline-flex items-center gap-1.5 shrink-0" title={title}>
      <Folder className={`${iconSizes[size]} ${folderColor} drop-shadow-sm`} strokeWidth={1.5} />
      {showLabel && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${labelColor}`}>
          {labelText}
        </span>
      )}
    </div>
  );
};

export const NewsCalendarView: React.FC<NewsCalendarViewProps> = ({
  onOpenNewTradeWithContext,
}) => {
  const [events, setEvents] = useState<ForexNewsEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [, setLastUpdated] = useState<string | null>(null);
  const [, setIsCached] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Filter states
  // Default to 'ACTIVE' (Today + upcoming days). Passed days are hidden!
  const [selectedDay, setSelectedDay] = useState<string>('ACTIVE');
  const [showPastDays, setShowPastDays] = useState<boolean>(false);
  const [showMoreDays, setShowMoreDays] = useState<boolean>(false);
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
        } catch {
          // ignore
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

  // Calculate local date string YYYY-MM-DD
  const formatLocalDateKey = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = useMemo(() => formatLocalDateKey(currentTime), [currentTime]);
  const tomorrowStr = useMemo(() => {
    const tm = new Date(currentTime);
    tm.setDate(tm.getDate() + 1);
    return formatLocalDateKey(tm);
  }, [currentTime]);

  const getEventDateKey = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Unknown';
      return formatLocalDateKey(d);
    } catch {
      return 'Unknown';
    }
  };

  // Distinct day categorization (Past vs Today vs Upcoming)
  const { pastDates, upcomingDates, todayItem, tomorrowItem } = useMemo(() => {
    const map = new Map<string, { dateStr: string; label: string; count: number; isPast: boolean; isToday: boolean; isTomorrow: boolean }>();
    events.forEach((ev) => {
      const key = getEventDateKey(ev.date);
      if (key === 'Unknown') return;
      const d = new Date(ev.date);
      const isPast = key < todayStr;
      const isToday = key === todayStr;
      const isTomorrow = key === tomorrowStr;

      if (!map.has(key)) {
        const label = d.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        });
        map.set(key, { dateStr: key, label, count: 1, isPast, isToday, isTomorrow });
      } else {
        map.get(key)!.count += 1;
      }
    });

    const all = Array.from(map.values()).sort((a, b) => a.dateStr.localeCompare(b.dateStr));
    const past = all.filter((d) => d.isPast);
    const upcoming = all.filter((d) => !d.isPast);
    const today = all.find((d) => d.isToday) || null;
    const tomorrow = all.find((d) => d.isTomorrow) || null;

    return { allDates: all, pastDates: past, upcomingDates: upcoming, todayItem: today, tomorrowItem: tomorrow };
  }, [events, todayStr, tomorrowStr]);

  // Active / Upcoming releases count (excluding past days)
  const activeEventsCount = useMemo(() => {
    return events.filter((ev) => getEventDateKey(ev.date) >= todayStr).length;
  }, [events, todayStr]);

  // High Impact count for active releases
  const activeHighImpactCount = useMemo(() => {
    return events.filter((e) => e.impact === 'High' && getEventDateKey(e.date) >= todayStr).length;
  }, [events, todayStr]);

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

  // Imminent risk event (within 4 hours)
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

      const evDateKey = getEventDateKey(ev.date);

      // Day filter
      if (selectedDay === 'TODAY') {
        if (evDateKey !== todayStr) return false;
      } else if (selectedDay === 'TOMORROW') {
        if (evDateKey !== tomorrowStr) return false;
      } else if (selectedDay !== 'ACTIVE' && selectedDay !== 'ALL') {
        if (evDateKey !== selectedDay) return false;
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
  const { pastGroups, upcomingGroups } = useMemo(() => {
    const groups: Record<string, { label: string; dateKey: string; date: Date; items: ForexNewsEvent[] }> = {};

    filteredEvents.forEach((ev) => {
      const dateKey = getEventDateKey(ev.date);
      if (dateKey === 'Unknown') return;

      if (!groups[dateKey]) {
        const d = new Date(ev.date);
        groups[dateKey] = {
          dateKey,
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
    });

    const allSorted = Object.values(groups).sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    const past = allSorted.filter((g) => g.dateKey < todayStr);
    const upcoming = allSorted.filter((g) => g.dateKey >= todayStr);

    return { pastGroups: past, upcomingGroups: upcoming };
  }, [filteredEvents, todayStr]);

  // Final displayed day groups with Forex Factory "Show More" logic
  const displayedGroups = useMemo(() => {
    if (selectedDay === 'TODAY') {
      return upcomingGroups.filter((g) => g.dateKey === todayStr);
    }
    if (selectedDay === 'TOMORROW') {
      return upcomingGroups.filter((g) => g.dateKey === tomorrowStr);
    }
    if (selectedDay !== 'ACTIVE' && selectedDay !== 'ALL') {
      return [...pastGroups, ...upcomingGroups].filter((g) => g.dateKey === selectedDay);
    }

    // Default 'ACTIVE' or 'ALL':
    // 1. By default, passed days are hidden unless user explicitly enabled showPastDays!
    const baseUpcoming = showMoreDays ? upcomingGroups : upcomingGroups.slice(0, 2);
    return showPastDays ? [...pastGroups, ...baseUpcoming] : baseUpcoming;
  }, [selectedDay, pastGroups, upcomingGroups, todayStr, tomorrowStr, showPastDays, showMoreDays]);

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

  const userTimezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      return 'Local';
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards: Active Releases Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Active Releases */}
        <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Upcoming Releases</span>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">{activeEventsCount}</span>
            <span className="text-xs text-slate-400">From today forward</span>
          </div>
        </div>

        {/* High Impact Alert with Red Folder */}
        <div className="bg-[#131317] border border-rose-500/20 bg-rose-500/[0.02] p-4 rounded-xl">
          <div className="flex items-center justify-between text-xs text-rose-400 font-medium">
            <span>High Impact Releases</span>
            <Folder className="w-4 h-4 fill-red-600 text-red-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-400">{activeHighImpactCount}</span>
            <span className="text-xs text-slate-400">Red folder releases</span>
          </div>
        </div>

        {/* Next High Impact Event Countdown */}
        <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Next High Impact Event</span>
            </span>
            {nextHighImpactEvent && (
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold flex items-center gap-1">
                <Folder className="w-3 h-3 fill-red-600 text-red-500" />
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

      {/* Immediate Risk Alert Banner */}
      {imminentRiskEvent && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-start gap-3.5 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-2">
              <Folder className="w-4 h-4 fill-red-600 text-red-500" />
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
              . Volatility expected across{' '}
              <span className="font-mono font-semibold">
                {(CURRENCY_PAIR_HINTS[imminentRiskEvent.country] || [imminentRiskEvent.country]).join(', ')}
              </span>
              . Consider tightening risk or waiting for release.
            </p>
          </div>
        </div>
      )}

      {/* Filter Toolbar with Forex Factory Folder Badges */}
      <div className="bg-[#131317] border border-white/[0.06] p-4 rounded-xl space-y-4">
        {/* Row 1: Search & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
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

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setSelectedImpacts(['High']);
              }}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer border flex items-center gap-1.5 ${
                selectedImpacts.length === 1 && selectedImpacts[0] === 'High'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-semibold'
                  : 'bg-white/[0.03] text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border-white/[0.06]'
              }`}
            >
              <Folder className="w-3.5 h-3.5 fill-red-600 text-red-500" />
              <span>Red Folder Only</span>
            </button>

            <button
              onClick={() => {
                setSelectedImpacts(['High', 'Medium', 'Low', 'Holiday']);
                setSelectedCurrencies([]);
                setSelectedDay('ACTIVE');
                setShowPastDays(false);
                setShowMoreDays(false);
                setSearchQuery('');
              }}
              className="text-xs px-3 py-1.5 rounded-lg font-medium text-slate-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors cursor-pointer"
            >
              Reset
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

        {/* Row 2: Day Selection (Forex Factory Style - Passed Days Hidden by Default) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> View:
          </span>

          {/* Today Button */}
          {todayItem && (
            <button
              onClick={() => {
                setSelectedDay('TODAY');
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedDay === 'TODAY'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.08]'
              }`}
            >
              Today ({todayItem.label})
            </button>
          )}

          {/* Tomorrow Button */}
          {tomorrowItem && (
            <button
              onClick={() => {
                setSelectedDay('TOMORROW');
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedDay === 'TOMORROW'
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
              }`}
            >
              Tomorrow ({tomorrowItem.label})
            </button>
          )}

          {/* Active Schedule (Today + Upcoming) */}
          <button
            onClick={() => {
              setSelectedDay('ACTIVE');
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === 'ACTIVE'
                ? 'bg-white/[0.12] text-white border border-white/[0.18]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Active Days
          </button>

          <div className="h-4 w-px bg-white/[0.08] mx-1 shrink-0" />

          {/* Upcoming Days Quick Chips */}
          {upcomingDates.map((item) => (
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

          {/* Optional Past Days Toggle */}
          {pastDates.length > 0 && (
            <>
              <div className="h-4 w-px bg-white/[0.08] mx-1 shrink-0" />
              <button
                onClick={() => setShowPastDays((prev) => !prev)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  showPastDays
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                }`}
                title="Toggle earlier days that have already passed"
              >
                <History className="w-3 h-3" />
                <span>{showPastDays ? 'Hide Past Days' : `Past Days (${pastDates.length})`}</span>
              </button>
            </>
          )}
        </div>

        {/* Row 3: Forex Factory Folder Impact Toggles & Currency Chips */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-white/[0.04]">
          {/* Forex Factory Folder Impact Toggles */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Impact:
            </span>

            {/* Red Folder */}
            <button
              onClick={() => toggleImpact('High')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('High')
                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30 font-semibold'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
              title="High Impact"
            >
              <Folder className="w-3.5 h-3.5 fill-red-600 text-red-500" />
              <span>Red Folder</span>
            </button>

            {/* Orange Folder */}
            <button
              onClick={() => toggleImpact('Medium')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Medium')
                  ? 'bg-orange-500/15 text-orange-300 border-orange-500/30 font-semibold'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
              title="Medium Impact"
            >
              <Folder className="w-3.5 h-3.5 fill-orange-500 text-orange-400" />
              <span>Orange</span>
            </button>

            {/* Yellow Folder */}
            <button
              onClick={() => toggleImpact('Low')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Low')
                  ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30 font-semibold'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
              title="Low Impact"
            >
              <Folder className="w-3.5 h-3.5 fill-amber-400 text-amber-300" />
              <span>Yellow</span>
            </button>

            {/* Gray Folder */}
            <button
              onClick={() => toggleImpact('Holiday')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors cursor-pointer border ${
                selectedImpacts.includes('Holiday')
                  ? 'bg-slate-500/15 text-slate-300 border-slate-500/30'
                  : 'bg-white/[0.02] text-slate-500 border-white/[0.04] opacity-50'
              }`}
              title="Non-Economic / Bank Holiday"
            >
              <Folder className="w-3.5 h-3.5 fill-slate-500 text-slate-400" />
              <span>Gray</span>
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

      {/* Notice if Past Days are Hidden */}
      {!showPastDays && pastGroups.length > 0 && selectedDay === 'ACTIVE' && (
        <div className="flex items-center justify-between px-4 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Passed days from this week are hidden by default.</span>
          </span>
          <button
            onClick={() => setShowPastDays(true)}
            className="text-blue-400 hover:text-blue-300 underline font-medium cursor-pointer"
          >
            Show earlier days ({pastGroups.length})
          </button>
        </div>
      )}

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
      ) : displayedGroups.length === 0 ? (
        <div className="bg-[#131317] border border-white/[0.06] rounded-xl p-12 text-center space-y-2">
          <Filter className="w-6 h-6 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No economic events match your active filters</p>
          <p className="text-xs text-slate-500">Try adjusting your impact level, currency filters, or day selector.</p>
          <button
            onClick={() => {
              setSelectedImpacts(['High', 'Medium', 'Low', 'Holiday']);
              setSelectedCurrencies([]);
              setSelectedDay('ACTIVE');
              setShowPastDays(false);
              setSearchQuery('');
            }}
            className="text-xs text-blue-400 hover:text-blue-300 underline mt-2 cursor-pointer inline-block"
          >
            Reset all filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedGroups.map((group) => {
            const isToday = group.dateKey === todayStr;
            const isTomorrow = group.dateKey === tomorrowStr;
            const isPast = group.dateKey < todayStr;

            return (
              <div key={group.dateKey} className="space-y-1">
                {/* Date Header Strip */}
                <div className="flex items-center justify-between px-3 py-2 bg-[#131317]/95 border-b border-white/[0.06] rounded-t-lg sticky top-[57px] z-20 backdrop-blur-md">
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
                    {isPast && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-500">
                        PASSED
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {group.items.length} {group.items.length === 1 ? 'event' : 'events'}
                  </span>
                </div>

                {/* Table Header (Forex Factory Standard Layout) */}
                <div className="bg-[#131317] border border-white/[0.06] rounded-b-xl overflow-hidden">
                  <div className="hidden sm:grid grid-cols-12 gap-3 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 bg-white/[0.02] border-b border-white/[0.06]">
                    <div className="col-span-2">Time</div>
                    <div className="col-span-1">Currency</div>
                    <div className="col-span-1 text-center">Impact</div>
                    <div className="col-span-4">Event</div>
                    <div className="col-span-1 text-right">Actual</div>
                    <div className="col-span-1 text-right">Forecast</div>
                    <div className="col-span-1 text-right">Previous</div>
                    <div className="col-span-1 text-right">Action</div>
                  </div>

                  {/* Table of Events for this Day */}
                  <div className="divide-y divide-white/[0.04]">
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
                          key={ev.id || `${group.dateKey}-${idx}`}
                          className={`grid grid-cols-12 items-center p-3 sm:px-4 sm:py-2.5 gap-2 sm:gap-3 hover:bg-white/[0.02] transition-colors ${
                            isImminent && isHighImpact
                              ? 'bg-rose-500/[0.04] border-l-2 border-l-rose-500'
                              : ''
                          }`}
                        >
                          {/* Time */}
                          <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 font-mono text-xs text-slate-300 font-medium">
                            <Clock className="w-3 h-3 text-slate-500 hidden sm:inline shrink-0" />
                            <span>{timeStr}</span>
                          </div>

                          {/* Currency */}
                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/[0.06] text-slate-200 border border-white/[0.08] inline-block text-center">
                              {ev.country}
                            </span>
                          </div>

                          {/* Impact Folder Icon (Forex Factory) */}
                          <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                            <ImpactFolder impact={ev.impact} size="md" />
                          </div>

                          {/* Event Title */}
                          <div className="col-span-5 sm:col-span-4 min-w-0 pr-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-100 hover:text-white transition-colors truncate">
                                {ev.title}
                              </span>
                              {isImminent && (
                                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0 animate-pulse">
                                  Imminent
                                </span>
                              )}
                            </div>
                            {CURRENCY_PAIR_HINTS[ev.country] && (
                              <div className="text-[10px] text-slate-400 font-mono truncate hidden sm:block">
                                Pairs: {CURRENCY_PAIR_HINTS[ev.country].slice(0, 3).join(', ')}
                              </div>
                            )}
                          </div>

                          {/* Actual (Released) */}
                          <div className="hidden sm:block col-span-1 text-right font-mono text-xs">
                            {ev.actual ? (
                              <span className="font-bold text-emerald-400">{ev.actual}</span>
                            ) : (
                              <span className="text-slate-600">—</span>
                            )}
                          </div>

                          {/* Forecast */}
                          <div className="hidden sm:block col-span-1 text-right font-mono text-xs text-slate-300">
                            {ev.forecast || <span className="text-slate-600">—</span>}
                          </div>

                          {/* Previous */}
                          <div className="hidden sm:block col-span-1 text-right font-mono text-xs text-slate-400">
                            {ev.previous || <span className="text-slate-600">—</span>}
                          </div>

                          {/* Action */}
                          <div className="hidden sm:flex col-span-1 items-center justify-end">
                            {onOpenNewTradeWithContext && (
                              <button
                                onClick={() => {
                                  onOpenNewTradeWithContext(`Traded around Forex Factory news: ${ev.title} (${ev.country})`);
                                }}
                                className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                title={`Log trade related to ${ev.title}`}
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Forex Factory "Show More" Button for remaining upcoming days */}
          {selectedDay === 'ACTIVE' && upcomingGroups.length > 2 && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowMoreDays((prev) => !prev)}
                className="flex items-center gap-2 bg-[#18181E] hover:bg-[#202028] border border-white/[0.08] hover:border-white/[0.15] text-xs font-medium text-slate-200 px-5 py-2.5 rounded-lg transition-colors cursor-pointer shadow-sm"
              >
                {showMoreDays ? (
                  <>
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                    <span>Show Fewer Days</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 text-blue-400" />
                    <span>Show More Days ({upcomingGroups.length - 2} more upcoming)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Attribution & Notice Footer */}
      <div className="p-4 bg-[#131317]/50 border border-white/[0.04] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            Data provided by{' '}
            <strong className="text-slate-300">Forex Factory / Fair Economy Media</strong>. Cached locally to avoid rate limits.
          </span>
        </div>
        <div className="text-[11px] font-mono text-slate-400">
          Source: nfs.faireconomy.media
        </div>
      </div>
    </div>
  );
};

