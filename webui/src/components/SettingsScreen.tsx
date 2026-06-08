import { useState } from 'react';
import type { Profile } from '../types';
import { localToday } from '../lib/api';

interface Props {
  profile: Profile;
  remindersEnabled: boolean;
  remindersSupported: boolean;
  onToggleReminders: (on: boolean) => void;
  onSave: (p: { goalMl?: number; nickname?: string }) => Promise<boolean>;
  onBack: () => void;
}

const GOAL_MIN = 500;
const GOAL_MAX = 6000;
const GOAL_STEP = 100;
const NICK_RE = /^[a-zA-Z0-9_]{0,20}$/;

// Recreated from the design handoff's SettingsScreen, wired to PUT /profile.
export function SettingsScreen({
  profile,
  remindersEnabled,
  remindersSupported,
  onToggleReminders,
  onSave,
  onBack,
}: Props) {
  const [goal, setGoal] = useState(profile.goalMl);
  const [name, setName] = useState(profile.nickname ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Demo helpers: mutate localStorage then hard-reload so App re-reads the flags
  // and replays the relevant full-screen flow / achievement state.
  const demo = (mutate: () => void) => {
    mutate();
    window.location.reload();
  };

  const save = async () => {
    if (!Number.isInteger(goal) || goal < GOAL_MIN || goal > GOAL_MAX) {
      setError(`每日目標需介於 ${GOAL_MIN}–${GOAL_MAX} ml`);
      return;
    }
    if (!NICK_RE.test(name)) {
      setError('暱稱限 20 字內的英數字或底線');
      return;
    }
    setError(null);
    setSaving(true);
    const ok = await onSave({ goalMl: goal, nickname: name });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    }
  };

  return (
    <>
      <div className="set-header">
        <button className="set-back" onClick={onBack} aria-label="返回">
          ‹
        </button>
        <span className="set-title">設定</span>
      </div>

      <div className="set-section">每日目標</div>
      <div className="set-row">
        <div>
          <div className="set-label">每日喝水目標</div>
          <div className="set-sub">建議 1500–2500 ml</div>
        </div>
        <div className="stepper">
          <button className="stepper-btn" onClick={() => setGoal((g) => Math.max(GOAL_MIN, g - GOAL_STEP))} aria-label="減少目標">
            −
          </button>
          <div className="stepper-val">{goal}</div>
          <button className="stepper-btn" onClick={() => setGoal((g) => Math.min(GOAL_MAX, g + GOAL_STEP))} aria-label="增加目標">
            +
          </button>
        </div>
      </div>
      <div className="set-unit">ml</div>

      <div className="set-section">個人設定</div>
      <div className="set-row">
        <div>
          <div className="set-label">暱稱</div>
          <div className="set-sub">顯示在問候語中</div>
        </div>
        <input
          className="text-input"
          type="text"
          maxLength={20}
          value={name}
          placeholder="小植物"
          aria-label="暱稱"
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="set-row">
        <div>
          <div className="set-label">喝水提醒</div>
          <div className="set-sub">{remindersSupported ? '每隔一段時間提醒你喝水' : '此瀏覽器不支援通知'}</div>
        </div>
        <button
          className={`toggle ${remindersEnabled ? 'on' : ''}`}
          role="switch"
          aria-checked={remindersEnabled}
          aria-label="喝水提醒"
          disabled={!remindersSupported}
          onClick={() => onToggleReminders(!remindersEnabled)}
        >
          <span className="toggle-thumb" />
        </button>
      </div>

      {remindersEnabled && (
        <div className="remind-info">
          <span>💧</span>
          <span>每次喝水後2小時將提醒你</span>
        </div>
      )}

      {error && <p className="field-error">{error}</p>}

      <button className={`save-btn ${saved ? 'is-saved' : ''}`} onClick={save} disabled={saving}>
        {saved ? '✓ 已儲存！' : saving ? '儲存中…' : '儲存'}
      </button>

      <div className="set-section" style={{ marginTop: 22 }}>
        示範（給 demo 用）
      </div>
      <button
        className="demo-btn demo-btn--wide"
        onClick={() =>
          demo(() => {
            // Advance the app's "today" by a real day: fresh date → water resets
            // to 0, plant back to seed, and the new-day animation plays.
            const cur = parseInt(localStorage.getItem('plantBuddyDemoDayOffset') ?? '0', 10) || 0;
            localStorage.setItem('plantBuddyDemoDayOffset', String(cur + 1));
          })
        }
      >
        🌅 跳到下一天
      </button>

      <div className="set-sub" style={{ padding: '10px 4px 6px' }}>
        模擬連續達標天數（解鎖花朵外觀）
      </div>
      <div className="demo-grid demo-grid--4">
        {[3, 7, 14, 30].map((d) => (
          <button
            key={d}
            className="demo-btn"
            onClick={() =>
              demo(() => {
                localStorage.setItem('plantBuddyDemoStreak', String(d));
                localStorage.removeItem('plantBuddyUnlocked'); // replay the unlock
              })
            }
          >
            {d}天
          </button>
        ))}
      </div>
      <button
        className="demo-btn demo-btn--clear"
        onClick={() =>
          demo(() => {
            localStorage.removeItem('plantBuddyDemoStreak');
            localStorage.removeItem('plantBuddyUnlocked');
            localStorage.removeItem('plantBuddyLifelineDate');
            localStorage.removeItem('plantBuddyDemoDayOffset');
            // Offset is gone, so localToday() is the real date — mark it seen to
            // avoid a stray new-day screen right after resetting.
            localStorage.setItem('plantBuddyLastSeenDate', localToday());
          })
        }
      >
        清除示範狀態
      </button>
    </>
  );
}
