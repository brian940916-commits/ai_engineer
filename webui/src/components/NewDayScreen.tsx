import type { StatusResponse } from '../types';
import { localToday } from '../lib/api';
import { PlantView } from './PlantView';

interface Props {
  status: StatusResponse; // already-loaded backend data
  onContinue: () => void;
}

// "New day" transition: the backend resets the plant to a seed each calendar day,
// but the reset is invisible to the user — this screen makes it tangible. The
// plant is FORCED to stage='seed' mood='ok' here (not status.plant) so the user
// literally sees it start over; the real state renders once they continue.
function yesterdayOf(today: string): string {
  const [y, m, d] = today.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

export function NewDayScreen({ status, onContinue }: Props) {
  const nickname = status.profile.nickname || '小植物';
  const yesterday = yesterdayOf(localToday());
  const yd = status.history.find((h) => h.date === yesterday);
  const yesterdayMet = yd ? yd.progress >= 1 : false;

  return (
    <main className="newday">
      <h1 className="newday__title" style={{ animationDelay: '0.2s' }}>
        ✨ 新的一天開始了！
      </h1>

      <div className="newday__art">
        <PlantView plant={{ stage: 'seed', mood: 'ok', progress: 0 }} />
      </div>

      <p className="newday__msg" style={{ animationDelay: '0.35s' }}>
        {nickname}，今天也要好好喝水喔 💧
      </p>

      {yd && (
        <p className="newday__yesterday" style={{ animationDelay: '0.5s' }}>
          昨天：{yd.totalMl.toLocaleString()}ml　{yesterdayMet ? '達標 ✅' : '未達標 😢'}
        </p>
      )}

      <button className="newday__btn" style={{ animationDelay: '1.2s' }} onClick={onContinue}>
        開始今天！
      </button>
    </main>
  );
}
