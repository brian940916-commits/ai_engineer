import { getDrinkLog } from '../lib/drinkLog';

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

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function DrinkTimeChart() {
  const cutoff = Date.now() - SEVEN_DAYS;
  const totals: Record<BucketKey, { count: number; ml: number }> = {
    morning: { count: 0, ml: 0 },
    afternoon: { count: 0, ml: 0 },
    evening: { count: 0, ml: 0 },
    night: { count: 0, ml: 0 },
  };

  for (const e of getDrinkLog()) {
    if (e.ts <= cutoff) continue;
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
