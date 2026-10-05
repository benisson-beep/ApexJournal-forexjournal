import { useState, useEffect } from 'react';

export interface TimezoneOption {
  value: string;
  label: string;
  offset: string;
}

export const TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC — Coordinated Universal Time', offset: 'UTC+00:00' },
  { value: 'America/New_York', label: 'America / New York (EST / EDT)', offset: 'UTC-05:00 / UTC-04:00' },
  { value: 'America/Chicago', label: 'America / Chicago (CST / CDT)', offset: 'UTC-06:00 / UTC-05:00' },
  { value: 'America/Denver', label: 'America / Denver (MST / MDT)', offset: 'UTC-07:00 / UTC-06:00' },
  { value: 'America/Los_Angeles', label: 'America / Los Angeles (PST / PDT)', offset: 'UTC-08:00 / UTC-07:00' },
  { value: 'America/Sao_Paulo', label: 'America / São Paulo (BRT)', offset: 'UTC-03:00' },
  { value: 'Europe/London', label: 'Europe / London (GMT / BST)', offset: 'UTC+00:00 / UTC+01:00' },
  { value: 'Europe/Frankfurt', label: 'Europe / Frankfurt (CET / CEST)', offset: 'UTC+01:00 / UTC+02:00' },
  { value: 'Europe/Paris', label: 'Europe / Paris (CET / CEST)', offset: 'UTC+01:00 / UTC+02:00' },
  { value: 'Europe/Zurich', label: 'Europe / Zurich (CET / CEST)', offset: 'UTC+01:00 / UTC+02:00' },
  { value: 'Europe/Athens', label: 'Europe / Athens (EET / EEST - MT Server)', offset: 'UTC+02:00 / UTC+03:00' },
  { value: 'Europe/Nicosia', label: 'Europe / Cyprus (EET / EEST - MT Server)', offset: 'UTC+02:00 / UTC+03:00' },
  { value: 'Africa/Johannesburg', label: 'Africa / Johannesburg (SAST)', offset: 'UTC+02:00' },
  { value: 'Asia/Dubai', label: 'Asia / Dubai (GST)', offset: 'UTC+04:00' },
  { value: 'Asia/Kolkata', label: 'Asia / Kolkata (IST)', offset: 'UTC+05:30' },
  { value: 'Asia/Singapore', label: 'Asia / Singapore (SGT)', offset: 'UTC+08:00' },
  { value: 'Asia/Hong_Kong', label: 'Asia / Hong Kong (HKT)', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Asia / Tokyo (JST)', offset: 'UTC+09:00' },
  { value: 'Australia/Sydney', label: 'Australia / Sydney (AEST / AEDT)', offset: 'UTC+10:00 / UTC+11:00' },
  { value: 'Pacific/Auckland', label: 'Pacific / Auckland (NZST / NZDT)', offset: 'UTC+12:00 / UTC+13:00' },
];

/**
 * Checks if a timezone string is valid in the current environment
 */
export function isValidTimezone(tz: string): boolean {
  if (!tz) return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Resolves user's operational timezone from localStorage or browser settings
 */
export function getUserTimezone(): string {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('apex_profile_timezone');
      if (saved && isValidTimezone(saved)) {
        return saved;
      }
      const system = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (system && isValidTimezone(system)) {
        return system;
      }
    } catch {
      // ignore
    }
  }
  return 'America/New_York';
}

/**
 * Updates user timezone in localStorage and broadcasts change event
 */
export function setUserTimezone(tz: string): void {
  if (typeof window === 'undefined') return;
  if (!isValidTimezone(tz)) return;

  localStorage.setItem('apex_profile_timezone', tz);
  window.dispatchEvent(new Event('apex_profile_updated'));
}

/**
 * React hook to observe active user timezone dynamically
 */
export function useUserTimezone(): string {
  const [timezone, setTimezone] = useState<string>(() => getUserTimezone());

  useEffect(() => {
    const handleUpdate = () => {
      setTimezone(getUserTimezone());
    };

    window.addEventListener('apex_profile_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('apex_profile_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return timezone;
}

/**
 * Extracts zoned date parts (year, month, day, hour, minute, second) in the target timezone
 */
export function getZonedDateParts(
  dateOrIso: string | Date | number,
  tz?: string
): { year: number; month: number; day: number; hour: number; minute: number; second: number } {
  const d = typeof dateOrIso === 'string' || typeof dateOrIso === 'number' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
      day: now.getDate(),
      hour: now.getHours(),
      minute: now.getMinutes(),
      second: now.getSeconds(),
    };
  }

  const timeZone = tz || getUserTimezone();
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const partMap: Record<string, number> = {};
    for (const p of parts) {
      if (p.type !== 'literal') {
        partMap[p.type] = parseInt(p.value, 10);
      }
    }
    return {
      year: partMap['year'] ?? d.getFullYear(),
      month: (partMap['month'] ?? 1) - 1, // 0-indexed month
      day: partMap['day'] ?? d.getDate(),
      hour: (partMap['hour'] ?? 0) % 24,
      minute: partMap['minute'] ?? 0,
      second: partMap['second'] ?? 0,
    };
  } catch {
    return {
      year: d.getUTCFullYear(),
      month: d.getUTCMonth(),
      day: d.getUTCDate(),
      hour: d.getUTCHours(),
      minute: d.getUTCMinutes(),
      second: d.getUTCSeconds(),
    };
  }
}

/**
 * Returns date string 'YYYY-MM-DD' formatted in user's operational timezone
 */
export function getDateStrInTimezone(dateOrIso: string | Date | number, tz?: string): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' || typeof dateOrIso === 'number' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';

  const timeZone = tz || getUserTimezone();
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(d);
  } catch {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
}

/**
 * Returns time string 'HH:mm' (24-hour default) formatted in user's operational timezone
 */
export function getTimeStrInTimezone(
  dateOrIso: string | Date | number,
  tz?: string,
  options: { hour12?: boolean; withSeconds?: boolean } = {}
): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' || typeof dateOrIso === 'number' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';

  const timeZone = tz || getUserTimezone();
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: options.withSeconds ? '2-digit' : undefined,
      hour12: options.hour12 ?? false,
    }).format(d);
  } catch {
    const h = String(d.getUTCHours()).padStart(2, '0');
    const m = String(d.getUTCMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  }
}

/**
 * Formats full date or time in specified timezone with custom options
 */
export function formatDateInTimezone(
  dateOrIso: string | Date | number,
  options?: Intl.DateTimeFormatOptions,
  tz?: string
): string {
  if (!dateOrIso) return '';
  const d = typeof dateOrIso === 'string' || typeof dateOrIso === 'number' ? new Date(dateOrIso) : dateOrIso;
  if (isNaN(d.getTime())) return '';

  const timeZone = tz || getUserTimezone();
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone,
      ...options,
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/**
 * Converts a date ('YYYY-MM-DD') and time ('HH:mm') entered in target timezone to an exact UTC ISO-8601 string
 */
export function parseLocalToUtcIso(dateStr: string, timeStr: string, tz?: string): string {
  const [yearStr, monthStr, dayStr] = (dateStr || '').split('-');
  const [hourStr, minuteStr] = (timeStr || '12:00').split(':');

  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || 1;
  const day = parseInt(dayStr, 10) || 1;
  const hour = parseInt(hourStr, 10) || 0;
  const minute = parseInt(minuteStr, 10) || 0;

  const timeZone = tz || getUserTimezone();

  // Create an initial UTC guess based on the wall-clock inputs
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));

  try {
    const parts = getZonedDateParts(guessUtc, timeZone);
    const zonedAsUtcMs = Date.UTC(parts.year, parts.month, parts.day, parts.hour, parts.minute, parts.second);
    const offsetMs = zonedAsUtcMs - guessUtc.getTime();
    const trueUtc = new Date(guessUtc.getTime() - offsetMs);

    // Second pass to handle DST transition boundary edges
    const checkParts = getZonedDateParts(trueUtc, timeZone);
    const checkAsUtcMs = Date.UTC(checkParts.year, checkParts.month, checkParts.day, checkParts.hour, checkParts.minute, checkParts.second);
    const secondOffsetMs = checkAsUtcMs - guessUtc.getTime();
    if (secondOffsetMs !== 0) {
      return new Date(trueUtc.getTime() - secondOffsetMs).toISOString();
    }

    return trueUtc.toISOString();
  } catch {
    return guessUtc.toISOString();
  }
}

/**
 * Returns short abbreviation for timezone (e.g. 'EDT', 'EST', 'BST', 'GMT', 'UTC')
 */
export function getTimezoneAbbr(tz?: string, date: Date = new Date()): string {
  const timeZone = tz || getUserTimezone();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : timeZone;
  } catch {
    return timeZone;
  }
}

/**
 * Returns clean human-readable name for a timezone
 */
export function getTimezoneLabel(tz?: string): string {
  const timeZone = tz || getUserTimezone();
  const matched = TIMEZONES.find((t) => t.value === timeZone);
  if (matched) {
    const city = matched.label.split('(')[0].trim().replace(/^.*?\/\s*/, '');
    const abbr = getTimezoneAbbr(timeZone);
    return `${city} (${abbr})`;
  }
  const abbr = getTimezoneAbbr(timeZone);
  const city = timeZone.split('/').pop()?.replace(/_/g, ' ') || timeZone;
  return `${city} (${abbr})`;
}
