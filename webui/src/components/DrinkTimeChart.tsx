import { getDrinkLog } from '../lib/drinkLog';
import { recentLocalDates } from '../lib/api';

// Distribution of drinks by time-of-day over the last 7 days. Data is read from
// the local drink log (see drinkLog.ts) — the backend has no per-drink times yet.
const BUCKETS = [
  { key: 'morning', label: '早晨', range: '6-12' },
  { key: 'afternoon', label: '下午', range: '12-18' },
  { key: 'evening', label: '晚間', range: '18-22' },
  { key: 'night', label: '深夜', range: '22-6' },
] as const;

type BucketKey = (typeof BUCKETS)[number]['key'];

function bucketOf(hour: number): BucketKey {
  if (hour >= 6 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

function isoFromTs(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function DrinkTimeChart() {
  // Window by the app's last 7 local dates (honours the demo day-offset) rather
  // than wall-clock time, so the chart tracks "today" as the date advances.
  const windowDates = new Set(recentLocalDates(7));
  const totals: Record<BucketKey, { count: number; ml: number }> = {
    morning: { count: 0, ml: 0 },
    afternoon: { count: 0, ml: 0 },
    evening: { count: 0, ml: 0 },
    night: { count: 0, ml: 0 },
  };

  for (const e of getDrinkLog()) {
    const day = e.date ?? isoFromTs(e.ts); // fall back for pre-existing entries
    if (!windowDates.has(day)) continue;
    const b = totals[bucketOf(new Date(e.ts).getHours())];
    b.count += 1;
    b.ml += e.ml;
  }

  const maxCount = Math.max(1, ...BUCKETS.map((b) => totals[b.key].count));

  return (
    <div>
      <div className="section-label">喝水時段</div>
      <div className="dtc">
        {BUCKETS.map((b) => {
          const { count, ml } = totals[b.key];
          return (
            <div className="dtc-row" key={b.key}>
              <div className="dtc-period">
                <span className="dtc-period__name">{b.label}</span>
                <span className="dtc-period__range">{b.range}</span>
              </div>
              <div className="dtc-track">
                <div className="dtc-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
              </div>
              <div className="dtc-stat">
                {count}杯　{ml.toLocaleString()}ml
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
