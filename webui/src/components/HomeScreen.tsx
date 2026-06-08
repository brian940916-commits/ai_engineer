import { useEffect, useRef, useState } from 'react';
import type { StatusResponse } from '../types';
import { greeting, MOOD_ALERT, MOOD_CAPTION } from '../lib/copy';
import { PlantView } from './PlantView';
import { ProgressBar } from './ProgressBar';
import { QuickAdd } from './QuickAdd';
import { HistoryStrip } from './HistoryStrip';
import { WaterDrop } from './WaterDrop';

interface Props {
  status: StatusResponse;
  busy: boolean;
  onAdd: (amountMl: number) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({ status, busy, onAdd, onOpenSettings }: Props) {
  const { profile, today, plant, history } = status;
  const alert = plant.mood === 'thirsty' || plant.mood === 'wilting' ? MOOD_ALERT[plant.mood] : null;

  // Grow-bounce whenever today's total increases (design reward on logging water).
  const [bouncing, setBouncing] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const prevTotal = useRef(today.totalMl);

  // Play the water-drop splash immediately on tap (optimistic), then log.
  const handleAddWithAnim = (ml: number) => {
    setShowWater(false);
    requestAnimationFrame(() => setShowWater(true));
    window.setTimeout(() => setShowWater(false), 950);
    onAdd(ml);
  };
  useEffect(() => {
    if (today.totalMl > prevTotal.current) {
      setBouncing(false);
      requestAnimationFrame(() => setBouncing(true));
      const t = window.setTimeout(() => setBouncing(false), 700);
      prevTotal.current = today.totalMl;
      return () => clearTimeout(t);
    }
    prevTotal.current = today.totalMl;
  }, [today.totalMl]);

  return (
    <>
      <div className="greeting">
        <div className="greeting__hello">{greeting(profile.nickname)}</div>
        <div className="greeting__caption" aria-live="polite">
          {MOOD_CAPTION[plant.mood]}
        </div>
      </div>

      {alert && (
        <div className="mood-alert" role="alert">
          <span>{alert.emoji}</span>
          <span>{alert.text}</span>
        </div>
      )}

      <div className="plant-hero-wrap">
        {showWater && <WaterDrop />}
        <div className={`plant-hero${bouncing ? ' bounce' : ''}`}>
          <PlantView plant={plant} />
        </div>
      </div>

      <div className="card">
        <ProgressBar totalMl={today.totalMl} goalMl={profile.goalMl} />
      </div>

      <div className="card">
        <QuickAdd onAdd={handleAddWithAnim} disabled={busy} />
      </div>

      <div className="card">
        <HistoryStrip history={history} />
      </div>

      <div className="footer">
        <button className="footer-btn active">
          <span className="footer-icon">🌱</span>
          <span>主頁</span>
        </button>
        <button className="footer-btn" onClick={onOpenSettings}>
          <span className="footer-icon">⚙️</span>
          <span>設定</span>
        </button>
      </div>
    </>
  );
}
