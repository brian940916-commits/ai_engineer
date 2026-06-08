import { useCallback, useEffect, useRef, useState } from 'react';
import type { Screen } from './types';
import { useStatus } from './hooks/useStatus';
import { useReminders } from './hooks/useReminders';
import { HomeScreen } from './components/HomeScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Toast, type ToastData } from './components/Toast';
import { PlantGallery } from './components/PlantGallery';
import { BLOOM_MESSAGE } from './lib/copy';
import { localToday } from './lib/api';

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
  const toastId = useRef(0);

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
    },
    [addWater, showToast]
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
          <button type="button" className="btn btn--primary" onClick={() => void reload()}>
            重試
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      {screen === 'home' ? (
        <HomeScreen
          status={status}
          busy={busy}
          onAdd={handleAdd}
          onOpenSettings={() => setScreen('settings')}
        />
      ) : (
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

      {celebrating && (
        <div className="celebration" role="status" aria-live="assertive">
          <div className="celebration__confetti" aria-hidden="true">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} style={{ '--i': i } as React.CSSProperties} />
            ))}
          </div>
          <p className="celebration__msg">{BLOOM_MESSAGE}</p>
        </div>
      )}

      <Toast toast={toast} />
    </main>
  );
}
