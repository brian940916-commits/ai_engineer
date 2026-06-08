import { useState } from 'react';
import type { Profile } from '../types';

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

export function SettingsScreen({
  profile,
  remindersEnabled,
  remindersSupported,
  onToggleReminders,
  onSave,
  onBack,
}: Props) {
  const [goal, setGoal] = useState(profile.goalMl);
  const [nickname, setNickname] = useState(profile.nickname ?? '');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  function clampGoal(v: number) {
    setGoal(Math.max(GOAL_MIN, Math.min(GOAL_MAX, v)));
  }

  async function save() {
    if (!Number.isInteger(goal) || goal < GOAL_MIN || goal > GOAL_MAX) {
      setError(`每日目標需介於 ${GOAL_MIN}–${GOAL_MAX} ml`);
      return;
    }
    if (!NICK_RE.test(nickname)) {
      setError('暱稱限 20 字內的英數字或底線');
      return;
    }
    setError(null);
    setSaving(true);
    const ok = await onSave({ goalMl: goal, nickname });
    setSaving(false);
    if (ok) onBack();
  }

  return (
    <div className="settings">
      <header className="settings__header">
        <button type="button" className="iconbtn" onClick={onBack} aria-label="返回">
          ‹
        </button>
        <h1>設定</h1>
      </header>

      <label className="field">
        <span className="field__label">每日目標</span>
        <div className="stepper">
          <button
            type="button"
            className="stepper__btn"
            onClick={() => clampGoal(goal - GOAL_STEP)}
            aria-label="減少目標"
          >
            −
          </button>
          <span className="stepper__value">
            {goal} <span className="stepper__unit">ml</span>
          </span>
          <button
            type="button"
            className="stepper__btn"
            onClick={() => clampGoal(goal + GOAL_STEP)}
            aria-label="增加目標"
          >
            ＋
          </button>
        </div>
      </label>

      <label className="field">
        <span className="field__label">暱稱</span>
        <input
          type="text"
          className="text-input"
          value={nickname}
          maxLength={20}
          placeholder="你的名字"
          onChange={(e) => setNickname(e.target.value)}
        />
      </label>

      <div className="field field--row">
        <div>
          <span className="field__label">喝水提醒</span>
          <p className="field__hint">
            {remindersSupported ? '每隔一段時間提醒你喝水' : '此瀏覽器不支援通知'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={remindersEnabled}
          aria-label="喝水提醒"
          className={`switch ${remindersEnabled ? 'is-on' : ''}`}
          disabled={!remindersSupported}
          onClick={() => onToggleReminders(!remindersEnabled)}
        >
          <span className="switch__knob" />
        </button>
      </div>

      {error && <p className="field-error">{error}</p>}

      <button
        type="button"
        className="btn btn--primary btn--block"
        onClick={save}
        disabled={saving}
      >
        {saving ? '儲存中…' : '儲存'}
      </button>
    </div>
  );
}
