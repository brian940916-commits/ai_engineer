import type { StatusResponse } from '../types';
import { greeting, MOOD_CAPTION } from '../lib/copy';
import { PlantView } from './PlantView';
import { ProgressBar } from './ProgressBar';
import { QuickAdd } from './QuickAdd';
import { HistoryStrip } from './HistoryStrip';

interface Props {
  status: StatusResponse;
  busy: boolean;
  onAdd: (amountMl: number) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ status, busy, onAdd, onOpenSettings }: Props) {
  const { profile, today, plant, history } = status;
  const thirsty = plant.mood === 'thirsty' || plant.mood === 'wilting';

  return (
    <div className="home">
      <header className="home__header">
        <p className="home__greeting">{greeting(profile.nickname)}</p>
        <p className="home__caption" aria-live="polite">
          {MOOD_CAPTION[plant.mood]}
        </p>
      </header>

      {thirsty && (
        <div className="nudge" role="alert">
          {MOOD_CAPTION[plant.mood]}
        </div>
      )}

      <div className="home__hero">
        <PlantView plant={plant} />
      </div>

      <ProgressBar totalMl={today.totalMl} goalMl={profile.goalMl} progress={plant.progress} />

      <QuickAdd onAdd={onAdd} disabled={busy} />

      <HistoryStrip history={history} />

      <nav className="footer-nav" aria-label="主選單">
        <button type="button" className="footer-nav__btn" onClick={onOpenSettings}>
          <GearIcon />
          <span>設定</span>
        </button>
        <button
          type="button"
          className="footer-nav__btn"
          onClick={() =>
            document
              .querySelector('.history')
              ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        >
          <ChartIcon />
          <span>歷史</span>
        </button>
      </nav>
    </div>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.7-1l-.3-2.6h-4l-.3 2.6a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.4L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.7 1l.3 2.6h4l.3-2.6a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5Z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="nav-icon" aria-hidden="true">
      <rect x="4" y="12" width="4" height="8" rx="1.5" />
      <rect x="10" y="7" width="4" height="13" rx="1.5" />
      <rect x="16" y="3" width="4" height="17" rx="1.5" />
    </svg>
  );
}
