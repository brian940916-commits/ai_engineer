import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlantSkin, StatusResponse } from '../types';
import { greeting, MOOD_ALERT, MOOD_CAPTION } from '../lib/copy';
import { getPlantSpeech } from '../lib/plantSpeech';
import { PlantView } from './PlantView';
import { ProgressBar } from './ProgressBar';
import { QuickAdd } from './QuickAdd';
import { HistoryStrip } from './HistoryStrip';
import { WaterDrop } from './WaterDrop';
import { SpeechBubble } from './SpeechBubble';
import { DrinkTimeChart } from './DrinkTimeChart';

interface Props {
  status: StatusResponse;
  busy: boolean;
  skin: PlantSkin;
  streak: number;
  canUseLifeline: boolean;
  onUseLifeline: () => void;
  onAdd: (amountMl: number) => void;
  onOpenSettings: () => void;
}

export function HomeScreen({
  status,
  busy,
  skin,
  streak,
  canUseLifeline,
  onUseLifeline,
  onAdd,
  onOpenSettings,
}: Props) {
  const { profile, today, plant, history } = status;
  const alert = plant.mood === 'thirsty' || plant.mood === 'wilting' ? MOOD_ALERT[plant.mood] : null;

  // Grow-bounce whenever today's total increases (design reward on logging water).
  const [bouncing, setBouncing] = useState(false);
  const [showWater, setShowWater] = useState(false);
  const prevTotal = useRef(today.totalMl);

  // Speech bubbles. `key` remounts the bubble so a new line replays the animation.
  const [speech, setSpeech] = useState<{ text: string; key: number } | null>(null);
  const speechKey = useRef(0);
  const say = useCallback((text: string) => {
    if (!text) return;
    speechKey.current += 1;
    setSpeech({ text, key: speechKey.current });
  }, []);

  // Latest mood / last-drink, read by mount-only timers without stale closures.
  const moodRef = useRef(plant.mood);
  moodRef.current = plant.mood;
  const lastDrinkRef = useRef(today.lastDrinkAt);
  lastDrinkRef.current = today.lastDrinkAt;

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

  // onload: greet ~0.8s after the screen settles (once per mount).
  useEffect(() => {
    const t = window.setTimeout(() => say(getPlantSpeech(moodRef.current, 'onload')), 800);
    return () => clearTimeout(t);
  }, [say]);

  // afterDrink: a real drink moves lastDrinkAt (the optimistic bump doesn't), so
  // by the time this fires the mood is the reconciled post-drink mood.
  const prevLastDrink = useRef(today.lastDrinkAt);
  useEffect(() => {
    if (today.lastDrinkAt && today.lastDrinkAt !== prevLastDrink.current) {
      say(getPlantSpeech(plant.mood, 'afterDrink'));
    }
    prevLastDrink.current = today.lastDrinkAt;
  }, [today.lastDrinkAt, plant.mood, say]);

  // idle: if it's been >3h since the last drink, nudge once per app launch.
  useEffect(() => {
    let fired = false;
    const id = window.setInterval(() => {
      if (fired) return;
      const last = lastDrinkRef.current;
      const hours = last ? (Date.now() - new Date(last).getTime()) / 3_600_000 : Infinity;
      if (hours > 3) {
        const line = getPlantSpeech(moodRef.current, 'idle');
        if (line) {
          say(line);
          fired = true;
        }
      }
    }, 60_000);
    return () => clearInterval(id);
  }, [say]);

  return (
    <>
      <div className="greeting">
        <div className="greeting__hello">
          {greeting(profile.nickname)}
          {streak > 0 && <span className="streak-badge">🔥 {streak}天</span>}
        </div>
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

      {canUseLifeline && (
        <div className="lifeline-banner">
          <span>😮 昨天差一點！使用保命符？</span>
          <button className="lifeline-banner__btn" onClick={onUseLifeline}>
            用
          </button>
        </div>
      )}

      <div className="plant-hero-wrap">
        {showWater && <WaterDrop />}
        {speech && (
          <SpeechBubble key={speech.key} text={speech.text} onClose={() => setSpeech(null)} />
        )}
        <div className={`plant-hero${bouncing ? ' bounce' : ''}`}>
          <PlantView plant={plant} skin={skin} />
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

      <div className="card">
        <DrinkTimeChart />
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
