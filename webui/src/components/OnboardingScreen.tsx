import { useState } from 'react';
import { updateProfile } from '../lib/api';
import { PlantView } from './PlantView';

interface Props {
  onComplete: () => void;
}

// First-run welcome: name your plant, then never shown again. The nickname is
// persisted via the existing PUT /profile. Backend validates nickname as
// ^[a-zA-Z0-9_]{0,20}$, so the input is restricted to those characters here.
const SANITIZE = /[^a-zA-Z0-9_]/g;

export function OnboardingScreen({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const valid = name.trim().length > 0;

  const submit = async () => {
    const nickname = name.trim();
    if (!nickname || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updateProfile({ nickname });
      localStorage.setItem('plantBuddyOnboarded', 'true');
      setLeaving(true); // fade out, then hand off to the main app
      window.setTimeout(onComplete, 400);
    } catch (e) {
      setError(e instanceof Error ? e.message : '出了點問題，請再試一次');
      setSaving(false);
    }
  };

  return (
    <main className={`onboard${leaving ? ' is-leaving' : ''}`}>
      <div className="onboard__art">
        <PlantView plant={{ stage: 'seed', mood: 'happy', progress: 0 }} />
      </div>

      <h1 className="onboard__title">歡迎來到 Plant Buddy！</h1>
      <p className="onboard__sub">幫你的小植物取個名字吧 🌿</p>

      <input
        className="onboard__input"
        type="text"
        maxLength={16}
        value={name}
        placeholder="輸入名字（英數字，最多16字）"
        aria-label="植物名字"
        autoFocus
        disabled={saving}
        onChange={(e) => setName(e.target.value.replace(SANITIZE, ''))}
        onKeyDown={(e) => e.key === 'Enter' && void submit()}
      />

      <button className="onboard__btn" onClick={() => void submit()} disabled={!valid || saving}>
        {saving ? '建立中…' : '開始養植物！ 🌱'}
      </button>

      {error && <p className="onboard__error" role="alert">{error}</p>}

      <p className="onboard__hint">小提示：之後可以在設定裡修改</p>
    </main>
  );
}
