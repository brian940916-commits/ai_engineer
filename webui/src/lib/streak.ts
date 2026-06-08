import type { HistoryDay } from '../types';
import { localToday } from './api';

// Consecutive goal-met streak, computed purely on the client from GET /status
// history. A single "lifeline" (saved as plantBuddyLifelineDate) can rescue one
// missed day per streak cycle.
export interface StreakInfo {
  current: number; // consecutive met days, ending yesterday (today excluded)
  hasLifeline: boolean; // a lifeline is still available this cycle
  lifelineUsed: boolean; // the lifeline rescued a day in the current streak
}

function prevDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

export function yesterday(today: string = localToday()): string {
  return prevDay(today);
}

export function calcStreak(history: HistoryDay[]): StreakInfo {
  const byDate = new Map(history.map((h) => [h.date, h.progress]));
  const lifelineDate = localStorage.getItem('plantBuddyLifelineDate');

  let current = 0;
  let lifelineUsed = false;
  let cursor = yesterday();

  // Walk backwards day-by-day from yesterday until a day isn't met (and can't be
  // rescued). Bounded by a year as a safety net; history is far shorter.
  for (let i = 0; i < 366; i++) {
    const progress = byDate.get(cursor);
    if (progress !== undefined && progress >= 1) {
      current += 1;
    } else if (lifelineDate === cursor && !lifelineUsed) {
      current += 1;
      lifelineUsed = true;
    } else {
      break;
    }
    cursor = prevDay(cursor);
  }

  return { current, hasLifeline: !lifelineUsed, lifelineUsed };
}
