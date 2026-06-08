import { API_BASE } from '../config';
import { getUserId } from './identity';
import { logDrinkTime } from './drinkLog';
import type { Profile, RecordResponse, StatusResponse } from '../types';

// Demo only: "跳到下一天" advances this offset so the whole app (the date sent to
// the API, the history window, the new-day check) moves forward a real day. A
// fresh future date has no backend record, so water resets to 0 and the plant
// genuinely starts as a seed. Cleared by "清除示範狀態".
function demoDayOffset(): number {
  try {
    const n = parseInt(localStorage.getItem('plantBuddyDemoDayOffset') ?? '', 10);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

// "Today" is the client's LOCAL calendar date (YYYY-MM-DD), sent to the server so
// the day boundary matches the user's timezone (see 02-api-specification.md).
export function localToday(): string {
  const d = new Date();
  const offset = demoDayOffset();
  if (offset) d.setDate(d.getDate() + offset);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': getUserId(),
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // non-JSON error body; keep the status-code message
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

export const getStatus = (days = 7) =>
  api<StatusResponse>(`/status?date=${localToday()}&days=${days}`);

export const recordWater = (amountMl: number) =>
  api<RecordResponse>('/water', {
    method: 'POST',
    body: JSON.stringify({ amountMl, date: localToday() }),
  }).then((res) => {
    logDrinkTime(amountMl); // local time-of-day log (feature 6)
    return res;
  });

export const updateProfile = (p: { goalMl?: number; nickname?: string }) =>
  api<Profile>('/profile', { method: 'PUT', body: JSON.stringify(p) });
