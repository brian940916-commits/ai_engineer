// Local-only drink-time log (the backend doesn't store per-drink timestamps yet).
// Each successful recordWater appends an entry; we keep the last 30 days.
const KEY = 'plantBuddyDrinkLog';
const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

export interface DrinkEntry {
  ts: number; // Date.now() at the time of the drink (used for hour-of-day)
  ml: number;
  date?: string; // the app's local date (localToday); honours the demo offset
}

export function getDrinkLog(): DrinkEntry[] {
  try {
    const log = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(log) ? (log as DrinkEntry[]) : [];
  } catch {
    return [];
  }
}

export function logDrinkTime(amountMl: number, date: string): void {
  const cutoff = Date.now() - THIRTY_DAYS;
  const log = getDrinkLog().filter((e) => e.ts > cutoff);
  log.push({ ts: Date.now(), ml: amountMl, date });
  localStorage.setItem(KEY, JSON.stringify(log));
}
