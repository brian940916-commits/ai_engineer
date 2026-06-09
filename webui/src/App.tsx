import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PlantMood, Screen } from './types';
import { useStatus } from './hooks/useStatus';
import { useReminders } from './hooks/useReminders';
import { HomeScreen } from './components/HomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { GardenScreen } from './components/GardenScreen';
import { Toast, type ToastData } from './components/Toast';
import { PlantGallery } from './components/PlantGallery';
import { OnboardingScreen } from './components/OnboardingScreen';
import { NewDayScreen } from './components/NewDayScreen';
import { UnlockScreen } from './components/UnlockScreen';
import { BLOOM_MESSAGE } from './lib/copy';
import { localToday } from './lib/api';
import { calcStreak, yesterday } from './lib/streak';
import { STREAK_MILESTONES, readUnlockedMilestones, writeUnlockedMilestones } from './lib/achievements';
import { assignTodayFlower, bloomTodayFlower, isTodayBloomed, RARITY_LABEL } from './lib/garden';
import type { FlowerSpecies } from './lib/garden';

const DEMO_MOODS: PlantMood[] = ['sleepy', 'happy', 'ok', 'thirsty', 'wilting'];

export default function App() {
  // Dev-only: ?preview renders the stage × mood gallery, no backend required.
  if (typeof window !== 'undefined' && window.location.search.includes('preview')) {
    return <PlantGallery />;
  }

  const { status, loading, error, reload, addWater, saveProfile } = useStatus();
  const reminders = useReminders();
  const [screen, setScreen] = useState<Screen>('home');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const [celebrating, setCelebrating] = useState(false);
  const [onboarded, setOnboarded] = useState(() => !!localStorage.getItem('plantBuddyOnboarded'));
  const [newDaySeen, setNewDaySeen] = useState(
    () => localStorage.getItem('plantBuddyLastSeenDate') === localToday()
  );
  const [unlock, setUnlock] = useState<{ message: string } | null>(null);
  const [todayFlower, setTodayFlower] = useState<FlowerSpecies | null>(null);
  const [lifelineTick, setLifelineTick] = useState(0);
  const toastId = useRef(0);

  // Achievement streak (recomputed when status changes or a lifeline is used).
  const streakInfo = useMemo(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    () => (status ? calcStreak(status.history) : null),
    [status, lifelineTick]
  );
  // Demo override (Settings → 示範): force a streak so achievements can be shown.
  const [demoStreak] = useState(() => {
    const n = parseInt(localStorage.getItem('plantBuddyDemoStreak') ?? '', 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });
  const streakCount = demoStreak > 0 ? demoStreak : streakInfo?.current ?? 0;

  // Demo override (Settings → 模擬花朵情緒): force the displayed mood.
  const [demoMood] = useState<PlantMood | null>(() => {
    const m = localStorage.getItem('plantBuddyDemoMood');
    return DEMO_MOODS.includes(m as PlantMood) ? (m as PlantMood) : null;
  });

  // Yesterday missed → the lifeline banner may offer a rescue.
  const yesterdayMissed = useMemo(() => {
    if (!status) return false;
    const entry = status.history.find((h) => h.date === yesterday());
    return !!entry && entry.progress < 1;
  }, [status]);
  const canUseLifeline = !!streakInfo && streakInfo.hasLifeline && yesterdayMissed;

  const useLifeline = useCallback(() => {
    localStorage.setItem('plantBuddyLifelineDate', yesterday());
    setLifelineTick((t) => t + 1);
  }, []);

  // 連續天數達到里程碑時顯示解鎖訊息（解鎖更稀有的花種）。
  useEffect(() => {
    if (!status || streakCount === 0) return;
    const unlocked = readUnlockedMilestones();
    const newly = STREAK_MILESTONES.filter(
      (m) => streakCount >= m.days && !unlocked.includes(m.days)
    );
    if (newly.length === 0) return;
    writeUnlockedMilestones([...unlocked, ...newly.map((m) => m.days)]);
    const top = newly[newly.length - 1];
    setUnlock({ message: top.message });
  }, [status, streakCount]);

  // Assign (or recall) today's flower once status and streak are known.
  useEffect(() => {
    if (!status) return;
    const flower = assignTodayFlower(localToday(), streakCount);
    setTodayFlower(flower);
  }, [status, streakCount]);

  const showToast = useCallback((message: string, type: ToastData['type']) => {
    setToast({ id: ++toastId.current, message, type });
  }, []);

  // Auto-dismiss the current toast.
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Schedule the next reminder whenever the latest drink time changes.
  const { schedule } = reminders;
  useEffect(() => {
    schedule(status?.today.lastDrinkAt ?? null);
  }, [status?.today.lastDrinkAt, schedule]);

  // One-time-per-day bloom celebration when the goal is reached.
  useEffect(() => {
    if (status?.plant.stage !== 'blooming') return;
    const key = 'plantBuddyBloomCelebrated';
    if (localStorage.getItem(key) === localToday()) return;
    localStorage.setItem(key, localToday());
    setCelebrating(true);
    const t = window.setTimeout(() => setCelebrating(false), 4200);
    return () => clearTimeout(t);
  }, [status?.plant.stage]);

  const handleAdd = useCallback(
    async (amountMl: number) => {
      setBusy(true);
      const res = await addWater(amountMl);
      setBusy(false);
      if (!res) {
        showToast('喝水紀錄失敗，請再試一次', 'error');
        return;
      }
      showToast('咕嚕咕嚕～紀錄好了！', 'success');

      // 剛達標（progress >= 1）且今天還沒 bloom → 把今日花朵收入花田
      if (res.plant.progress >= 1 && !isTodayBloomed(localToday())) {
        bloomTodayFlower(localToday());
        const flower = todayFlower;
        if (flower) {
          setUnlock({
            message: `${flower.emoji} ${flower.name}盛開了！\n${RARITY_LABEL[flower.rarity]}花種收入花田 🌸`,
          });
        }
      }
    },
    [addWater, showToast, todayFlower]
  );

  const handleToggleReminders = useCallback(
    async (on: boolean) => {
      if (on) {
        const granted = await reminders.enable();
        if (!granted) showToast('請允許瀏覽器通知以開啟提醒', 'error');
      } else {
        reminders.disable();
      }
    },
    [reminders, showToast]
  );

  if (!onboarded) {
    return (
      <OnboardingScreen
        onComplete={() => {
          // Skip the new-day animation on the onboarding day (avoid two
          // back-to-back full-screens).
          localStorage.setItem('plantBuddyLastSeenDate', localToday());
          setNewDaySeen(true);
          setOnboarded(true);
        }}
      />
    );
  }

  if (loading && !status) {
    return (
      <main className="app app--center">
        <div className="splash">🌱 載入中…</div>
      </main>
    );
  }

  if (!status) {
    return (
      <main className="app app--center">
        <div className="errorbox">
          <p>{error ?? '無法連線到伺服器'}</p>
          <button type="button" className="confirm-btn" onClick={() => void reload()}>
            重試
          </button>
        </div>
      </main>
    );
  }

  if (!newDaySeen) {
    return (
      <NewDayScreen
        status={status}
        onContinue={() => {
          localStorage.setItem('plantBuddyLastSeenDate', localToday());
          setNewDaySeen(true);
        }}
      />
    );
  }

  return (
    <main className="app">
      {screen === 'home' && (
        <HomeScreen
          status={demoMood ? { ...status, plant: { ...status.plant, mood: demoMood } } : status}
          busy={busy}
          streak={streakCount}
          canUseLifeline={canUseLifeline}
          onUseLifeline={useLifeline}
          onAdd={handleAdd}
          onOpenSettings={() => setScreen('settings')}
          onOpenGarden={() => setScreen('garden')}
        />
      )}

      {screen === 'settings' && (
        <SettingsScreen
          profile={status.profile}
          remindersEnabled={reminders.enabled}
          remindersSupported={reminders.permission !== 'unsupported'}
          onToggleReminders={handleToggleReminders}
          onSave={async (p) => {
            const ok = await saveProfile(p);
            showToast(ok ? '已儲存設定 🌿' : '儲存失敗，請再試一次', ok ? 'success' : 'error');
            return ok;
          }}
          onBack={() => setScreen('home')}
        />
      )}

      {screen === 'garden' && (
        <GardenScreen
          goalMl={status.profile.goalMl}
          todayTotalMl={status.today.totalMl}
          onBack={() => setScreen('home')}
        />
      )}

      {celebrating && <Confetti />}

      {unlock && (
        <UnlockScreen
          message={unlock.message}
          onClose={() => setUnlock(null)}
        />
      )}

      <Toast toast={toast} />
    </main>
  );
}

// Bloom celebration: gold banner + floating confetti. Recreated from the design
// handoff's Confetti component.
const CONFETTI_COLORS = ['#F6C95B', '#5FB98E', '#6FC8E0', '#F890A8', '#E0A07A'];

function Confetti() {
  const dots = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 10 + Math.random() * 80,
    y: 15 + Math.random() * 65,
    size: 6 + Math.random() * 9,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: (Math.random() * 0.5).toFixed(2),
    dur: (1.2 + Math.random() * 0.9).toFixed(2),
  }));
  return (
    <div className="celebrate-layer" role="status" aria-live="assertive">
      <div className="celebrate-banner">{BLOOM_MESSAGE}</div>
      {dots.map((d) => (
        <div
          key={d.id}
          className="confetti-dot"
          style={
            {
              left: `${d.x}%`,
              top: `${d.y}%`,
              width: d.size,
              height: d.size,
              background: d.color,
              '--delay': `${d.delay}s`,
              '--dur': `${d.dur}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
