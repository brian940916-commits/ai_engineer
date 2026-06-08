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

// 7-day mini bar chart. Recreated from the design handoff's HistoryStrip, fed by
// the real GET /status history (the prototype used fake data).
export function HistoryStrip({ history }: Props) {
  if (history.length === 0) return null;
  const days = [...history].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const today = localToday();

  return (
    <div>
      <div className="section-label">近7天</div>
      <div className="hist-bars">
        {days.map((d) => {
          const pct = d.goalMl > 0 ? Math.min(d.totalMl / d.goalMl, 1) : 0;
          const met = pct >= 1;
          const isToday = d.date === today;
          const barH = Math.max(pct * 46, 5);
          return (
            <div key={d.date} className="hist-day" title={`${d.date}：${d.totalMl}/${d.goalMl} ml`}>
              <div
                className={`hist-bar ${met ? 'is-met' : ''} ${isToday ? 'is-today' : ''} ${isToday && !met ? 'is-unmet' : ''}`}
                style={{ height: barH }}
                aria-label={`${d.date} ${Math.round((d.goalMl > 0 ? d.totalMl / d.goalMl : 0) * 100)}%`}
              />
              <span className={`hist-label ${isToday ? 'is-today' : ''}`}>{isToday ? '今' : weekday(d.date)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
