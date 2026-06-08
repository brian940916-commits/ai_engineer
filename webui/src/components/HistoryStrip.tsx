import type { HistoryDay } from '../types';
import { localToday } from '../lib/api';

interface Props {
  history: HistoryDay[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function weekday(date: string): string {
  // date is YYYY-MM-DD (local calendar date); parse as local, not UTC.
  const [y, m, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// A little row of bars, like seedlings in a garden. Height = that day's progress
// (capped at the goal); a day that met its goal is filled green.
export function HistoryStrip({ history }: Props) {
  if (history.length === 0) return null;
  const days = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const today = localToday();

  return (
    <section className="history" aria-label="近 7 日喝水紀錄">
      <h2 className="history__title">近 7 日</h2>
      <div className="history__bars">
        {days.map((d) => {
          const reached = d.progress >= 1;
          const heightPct = Math.max(6, Math.min(d.progress, 1) * 100);
          const isToday = d.date === today;
          return (
            <div
              key={d.date}
              className={`history__day ${isToday ? 'is-today' : ''}`}
              title={`${d.date}：${d.totalMl}/${d.goalMl} ml`}
            >
              <div className="history__bar-track">
                <div
                  className={`history__bar ${reached ? 'is-reached' : ''}`}
                  style={{ height: `${heightPct}%` }}
                  aria-label={`${d.date} ${Math.round(d.progress * 100)}%`}
                />
              </div>
              <span className="history__label">{weekday(d.date)}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
