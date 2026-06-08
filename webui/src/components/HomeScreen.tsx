import { useCallback, useEffect, useRef, useState } from 'react';
import type { StatusResponse } from '../types';
import { deleteWater } from '../lib/api';
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
  streak: number;
  canUseLifeline: boolean;
  onUseLifeline: () => void;
  onAdd: (amountMl: number) => void;
  onOpenSettings: () => void;
  onOpenGarden: () => void;
  onRefresh: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}

export function HomeScreen({
  status,
  busy,
  streak,
  canUseLifeline,
  onUseLifeline,
  onAdd,
  onOpenSettings,
  onOpenGarden,
  onRefresh,
  onToast,
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
        <button
          type="button"
          className={`plant-hero plant-hero--tap${bouncing ? ' bounce' : ''}`}
          onClick={() => say(getPlantSpeech(plant.mood, 'tap'))}
          aria-label="戳一下小植物"
        >
          <PlantView plant={plant} />
        </button>
      </div>

      <div className="card">
        <ProgressBar totalMl={today.totalMl} goalMl={profile.goalMl} />
      </div>

      <div className="card">
        <QuickAdd onAdd={handleAddWithAnim} disabled={busy} />
      </div>

      {today.entries.length > 0 && (
        <div className="card">
          <EntryList
            date={today.date}
            entries={today.entries}
            onRefresh={onRefresh}
            onToast={onToast}
          />
        </div>
      )}

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
        <button className="footer-btn" onClick={onOpenGarden}>
          <span className="footer-icon">🌸</span>
          <span>花田</span>
        </button>
        <button className="footer-btn" onClick={onOpenSettings}>
          <span className="footer-icon">⚙️</span>
          <span>設定</span>
        </button>
      </div>
    </>
  );
}

// Today's drink entries with a per-row delete. Times are the UTC `at` rendered in
// the client's local timezone (HH:mm, no seconds).
function EntryList({
  date,
  entries,
  onRefresh,
  onToast,
}: {
  date: string;
  entries: { ml: number; at: string }[];
  onRefresh: () => void;
  onToast: (message: string, type: 'success' | 'error') => void;
}) {
  const [deleting, setDeleting] = useState<number | null>(null);

  const fmtTime = (at: string) =>
    new Date(at).toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

  const handleDelete = async (index: number) => {
    setDeleting(index);
    try {
      await deleteWater(date, index);
      onRefresh();
    } catch {
      onToast('刪除失敗，請再試一次', 'error');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div className="section-label">今日紀錄</div>
      <div className="entry-list">
        {entries.map((e, i) => (
          <div className="entry-row" key={`${e.at}-${i}`}>
            <span className="entry-row__time">🕐 {fmtTime(e.at)}</span>
            <span className="entry-row__ml">{e.ml}ml</span>
            <button
              type="button"
              className="entry-row__del"
              onClick={() => void handleDelete(i)}
              disabled={deleting !== null}
              aria-label="刪除這筆紀錄"
            >
              {deleting === i ? '…' : '✕'}
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
