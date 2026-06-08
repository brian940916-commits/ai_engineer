import type { HistoryDay } from '../types';
import { localToday } from '../lib/api';

interface Props {
  history: HistoryDay[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

function weekday(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

// The last 7 calendar dates ending today (oldest → newest), regardless of which
// ones exist in the data — so the chart always shows a full week.
function last7Dates(): string[] {
  const [y, m, d] = localToday().split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const p = (n: number) => String(n).padStart(2, '0');
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(base);
    dt.setDate(base.getDate() - (6 - i));
    return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
  });
}

function shortMl(ml: number): string {
  if (ml <= 0) return '';
  return ml >= 1000 ? `${(ml / 1000).toFixed(1)}L` : String(ml);
}

// 7-day mini bar chart, fed by GET /status history. Missing days render as empty
// slots so the week is always complete.
export function HistoryStrip({ history }: Props) {
  const byDate = new Map(history.map((h) => [h.date, h]));
  const fallbackGoal = history[0]?.goalMl ?? 2000;
  const today = localToday();

  return (
    <div>
      <div className="section-label">近 7 天</div>
      <div className="hist-bars">
        {last7Dates().map((date) => {
          const h = byDate.get(date);
          const total = h?.totalMl ?? 0;
          const goal = h?.goalMl ?? fallbackGoal;
          const pct = goal > 0 ? Math.min(total / goal, 1) : 0;
          const met = pct >= 1;
          const isToday = date === today;
          const barH = total > 0 ? Math.max(pct * 100, 8) : 3;
          return (
            <div key={date} className="hist-day" title={`${date}：${total}/${goal} ml`}>
              <span className="hist-amount">{shortMl(total)}</span>
              <div className="hist-col">
                <div
                  className={`hist-bar${met ? ' is-met' : ''}${isToday ? ' is-today' : ''}`}
                  style={{ height: `${barH}%` }}
                  aria-label={`${date} ${Math.round(pct * 100)}%`}
                />
              </div>
              <span className={`hist-label${isToday ? ' is-today' : ''}`}>
                {isToday ? '今' : weekday(date)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
