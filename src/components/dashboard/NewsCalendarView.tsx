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
} from 'lucide-react';
import { ForexNewsEvent, NewsCalendarResponse } from '../../types/trade';

interface NewsCalendarViewProps {
  onOpenNewTradeWithContext?: (contextNotes: string) => void;
}

const MAJOR_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD', 'CNY'];

/**
 * Forex Factory Signature Impact Folder Icon
 * Red = High Impact
 * Orange = Medium Impact
 * Yellow = Low Impact
 * Gray = Non-Economic / Holiday
 *
 * For passed events, the folder is dimmed / desaturated (Forex Factory style)
 */
export const ImpactFolder: React.FC<{
  impact: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  isPassed?: boolean;
}> = ({ impact, size = 'md', showLabel = false, isPassed = false }) => {
  const norm = (impact || '').toLowerCase();

  let folderColor = isPassed ? 'fill-slate-700/60 text-slate-500/60' : 'fill-slate-500 text-slate-400';
  let labelText = 'Holiday';
  let labelColor = isPassed
    ? 'text-slate-500 bg-slate-500/5 border-slate-500/10'
    : 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  let title = 'Non-Economic / Holiday';

  if (norm.includes('high') || norm === 'red') {
    folderColor = isPassed ? 'fill-red-950/70 text-red-500/50' : 'fill-red-600 text-red-500';
    labelText = 'High';
    labelColor = isPassed
      ? 'text-rose-500/50 bg-rose-500/5 border-rose-500/10'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    title = `High Impact (Red Folder)${isPassed ? ' · Concluded' : ''}`;
  } else if (norm.includes('medium') || norm.includes('med') || norm === 'orange') {
    folderColor = isPassed ? 'fill-orange-950/70 text-orange-500/50' : 'fill-orange-500 text-orange-400';
    labelText = 'Medium';
    labelColor = isPassed
      ? 'text-orange-500/50 bg-orange-500/5 border-orange-500/10'
      : 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    title = `Medium Impact (Orange Folder)${isPassed ? ' · Concluded' : ''}`;
  } else if (norm.includes('low') || norm === 'yellow') {
    folderColor = isPassed ? 'fill-amber-950/70 text-amber-500/50' : 'fill-amber-400 text-amber-300';
    labelText = 'Low';
    labelColor = isPassed
      ? 'text-yellow-500/50 bg-yellow-500/5 border-yellow-500/10'
      : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    title = `Low Impact (Yellow Folder)${isPassed ? ' · Concluded' : ''}`;
  }

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 shrink-0 ${isPassed ? 'opacity-50' : 'opacity-100'}`}
      title={title}
    >
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
  // Default to 'ALL' (Full week schedule, Forex Factory style)
  const [selectedDay, setSelectedDay] = useState<string>('ALL');
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
  const { allDates, todayItem, tomorrowItem } = useMemo(() => {
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
      } else if (selectedDay !== 'ALL') {
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

  // Group filtered events by Day and sort them chronologically
  const { allSortedGroups, pastGroups, upcomingGroups } = useMemo(() => {
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
    // Sort items within each day chronologically by time
    allSorted.forEach((g) => {
      g.items.sort((a, b) => {
        const tA = new Date(a.date).getTime();
        const tB = new Date(b.date).getTime();
        if (isNaN(tA) && isNaN(tB)) return 0;
        if (isNaN(tA)) return 1;
        if (isNaN(tB)) return -1;
        return tA - tB;
      });
    });

    const past = allSorted.filter((g) => g.dateKey < todayStr);
    const upcoming = allSorted.filter((g) => g.dateKey >= todayStr);

    return { allSortedGroups: allSorted, pastGroups: past, upcomingGroups: upcoming };
  }, [filteredEvents, todayStr]);

  // Final displayed day groups
  const displayedGroups = useMemo(() => {
    if (selectedDay === 'TODAY') {
      return allSortedGroups.filter((g) => g.dateKey === todayStr);
    }
    if (selectedDay === 'TOMORROW') {
      return allSortedGroups.filter((g) => g.dateKey === tomorrowStr);
    }
    if (selectedDay !== 'ALL') {
      return allSortedGroups.filter((g) => g.dateKey === selectedDay);
    }
    return allSortedGroups;
  }, [selectedDay, allSortedGroups, todayStr, tomorrowStr]);

  // Helper for relative time countdown & status
  const getEventTimeStatus = (dateStr: string) => {
    const evTime = new Date(dateStr).getTime();
    if (isNaN(evTime)) return { status: 'passed', label: '—', isPassed: true };

    const diffMs = evTime - currentTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);

    if (diffMs < -15 * 60 * 1000) {
      return { status: 'passed', label: 'Completed', isPassed: true };
    }
    if (diffMs < 0) {
      return { status: 'releasing', label: 'Released', isPassed: true };
    }
    if (diffMin <= 15) {
      return { status: 'imminent', label: `In ${diffMin}m`, isPassed: false };
    }
    if (diffHours < 1) {
      return { status: 'soon', label: `In ${diffMin}m`, isPassed: false };
    }
    if (diffHours < 24) {
      const remMin = diffMin % 60;
      return {
        status: 'upcoming_today',
        label: `In ${diffHours}h${remMin > 0 ? ` ${remMin}m` : ''}`,
        isPassed: false,
      };
    }
    const days = Math.floor(diffHours / 24);
    return { status: 'future', label: `In ${days}d`, isPassed: false };
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
              <span className="font-mono font-semibold">{imminentRiskEvent.country}</span> currency pairs.
              Consider tightening risk or waiting for release.
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
                setSelectedDay('ALL');
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

        {/* Row 2: Day Selection (Forex Factory Week Navigation) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> View:
          </span>

          {/* All Week Button */}
          <button
            onClick={() => {
              setSelectedDay('ALL');
            }}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedDay === 'ALL'
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            This Week ({events.length})
          </button>

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
              Today ({todayItem.count})
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
              Tomorrow ({tomorrowItem.count})
            </button>
          )}

          <div className="h-4 w-px bg-white/[0.08] mx-1 shrink-0" />

          {/* All Days Buttons (Mon - Fri) */}
          {allDates.map((item) => {
            const isSelected = selectedDay === item.dateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDay(item.dateStr)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-white/[0.12] text-white border border-white/[0.2] font-semibold'
                    : item.isPast
                    ? 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
                }`}
                title={item.isPast ? `${item.label} (Concluded)` : item.label}
              >
                <span>{item.label}</span>
                <span
                  className={`text-[10px] font-mono ${
                    isSelected ? 'text-white' : item.isPast ? 'text-slate-600' : 'text-slate-400'
                  }`}
                >
                  ({item.count})
                </span>
                {item.isPast && (
                  <span className="text-[9px] font-mono text-slate-500 uppercase">done</span>
                )}
              </button>
            );
          })}
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
              setSelectedDay('ALL');
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

            // Index of first upcoming event today
            const firstUpcomingIdx = isToday
              ? group.items.findIndex((e) => {
                  const t = new Date(e.date).getTime();
                  return !isNaN(t) && t >= currentTime.getTime();
                })
              : -1;

            return (
              <div key={group.dateKey} className="space-y-1">
                {/* Date Header Strip */}
                <div
                  className={`flex items-center justify-between px-3 py-2 bg-[#131317]/95 border-b border-white/[0.06] rounded-t-lg sticky top-[57px] z-20 backdrop-blur-md ${
                    isPast ? 'opacity-70' : 'opacity-100'
                  }`}
                >
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
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/[0.04] text-slate-500 border border-white/[0.06]">
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
                      const evTimeMs = evDate.getTime();
                      const timeStr = !isNaN(evTimeMs)
                        ? evDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'All Day';

                      const isPassed = !isNaN(evTimeMs)
                        ? evTimeMs < currentTime.getTime()
                        : isPast;

                      const timeStatus = getEventTimeStatus(ev.date);
                      const isHighImpact = ev.impact === 'High';
                      const isImminent = !isPassed && (timeStatus.status === 'imminent' || timeStatus.status === 'releasing');
                      const isSoon = !isPassed && (timeStatus.status === 'soon' || timeStatus.status === 'upcoming_today');

                      // Today's timeline divider right above the first upcoming event
                      const showTimelineDivider = isToday && idx === firstUpcomingIdx && firstUpcomingIdx > 0;

                      return (
                        <React.Fragment key={ev.id || `${group.dateKey}-${idx}`}>
                          {showTimelineDivider && (
                            <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/[0.08] border-y border-blue-500/25 my-0.5">
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
                                </span>
                                <span className="text-[11px] font-mono font-bold text-blue-300 uppercase tracking-wider">
                                  Current Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="h-px flex-1 bg-gradient-to-r from-blue-500/30 to-transparent" />
                              <span className="text-[10px] font-mono text-blue-400/80 uppercase">
                                Upcoming Releases Below ↓
                              </span>
                            </div>
                          )}

                          <div
                            className={`grid grid-cols-12 items-center p-3 sm:px-4 sm:py-2.5 gap-2 sm:gap-3 transition-colors ${
                              isPassed
                                ? 'opacity-60 hover:opacity-100 hover:bg-white/[0.02] bg-white/[0.005]'
                                : isImminent && isHighImpact
                                ? 'bg-rose-500/[0.06] border-l-2 border-l-rose-500 opacity-100'
                                : isImminent
                                ? 'bg-blue-500/[0.05] border-l-2 border-l-blue-500 opacity-100'
                                : 'hover:bg-white/[0.03] bg-white/[0.015] border-l-2 border-l-transparent opacity-100'
                            }`}
                          >
                            {/* Time */}
                            <div className="col-span-3 sm:col-span-2 flex items-center gap-1.5 font-mono text-xs">
                              <Clock className={`w-3 h-3 hidden sm:inline shrink-0 ${isPassed ? 'text-slate-600' : 'text-slate-400'}`} />
                              <span className={isPassed ? 'text-slate-400 font-normal' : 'text-slate-100 font-semibold'}>
                                {timeStr}
                              </span>
                            </div>

                            {/* Currency */}
                            <div className="col-span-2 sm:col-span-1">
                              <span
                                className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded border inline-block text-center ${
                                  isPassed
                                    ? 'bg-white/[0.03] text-slate-400 border-white/[0.05]'
                                    : 'bg-white/[0.08] text-white border-white/[0.12]'
                                }`}
                              >
                                {ev.country}
                              </span>
                            </div>

                            {/* Impact Folder Icon (Forex Factory) */}
                            <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
                              <ImpactFolder impact={ev.impact} size="md" isPassed={isPassed} />
                            </div>

                            {/* Event Title */}
                            <div className="col-span-5 sm:col-span-4 min-w-0 pr-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span
                                  className={`text-xs truncate transition-colors ${
                                    isPassed
                                      ? 'text-slate-300 font-normal hover:text-white'
                                      : 'text-white font-semibold'
                                  }`}
                                >
                                  {ev.title}
                                </span>
                                {isImminent && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold shrink-0 animate-pulse border border-rose-500/30">
                                    {timeStatus.label}
                                  </span>
                                )}
                                {!isImminent && isSoon && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500/15 text-blue-300 font-medium shrink-0 border border-blue-500/20 hidden md:inline">
                                    {timeStatus.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actual (Released or Pending) */}
                            <div className="hidden sm:block col-span-1 text-right font-mono text-xs">
                              {ev.actual ? (
                                <span className="font-bold text-emerald-400">{ev.actual}</span>
                              ) : isPassed ? (
                                <span className="text-slate-500">—</span>
                              ) : (
                                <span className="text-slate-600 font-mono text-[11px]">—</span>
                              )}
                            </div>

                            {/* Forecast */}
                            <div
                              className={`hidden sm:block col-span-1 text-right font-mono text-xs ${
                                isPassed ? 'text-slate-500' : 'text-slate-300'
                              }`}
                            >
                              {ev.forecast || <span className="text-slate-600">—</span>}
                            </div>

                            {/* Previous */}
                            <div
                              className={`hidden sm:block col-span-1 text-right font-mono text-xs ${
                                isPassed ? 'text-slate-500' : 'text-slate-400'
                              }`}
                            >
                              {ev.previous || <span className="text-slate-600">—</span>}
                            </div>

                            {/* Action */}
                            <div className="hidden sm:flex col-span-1 items-center justify-end">
                              {onOpenNewTradeWithContext && (
                                <button
                                  onClick={() => {
                                    onOpenNewTradeWithContext(
                                      `Traded around Forex Factory economic event: ${ev.title} (${ev.country})`
                                    );
                                  }}
                                  className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors cursor-pointer"
                                  title={`Log trade related to ${ev.title}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
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

