import { useState } from 'react';

interface Props {
  onAdd: (amountMl: number) => void;
  disabled?: boolean;
}

const PRESETS = [200, 300, 500];

function Drop() {
  return (
    <svg className="drop-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5 C7 9 5 12.5 5 15.5 a7 7 0 0 0 14 0 C19 12.5 17 9 12 2.5 Z" />
    </svg>
  );
}

export function QuickAdd({ onAdd, disabled }: Props) {
  const [custom, setCustom] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submitCustom() {
    const ml = Number(value);
    if (!Number.isInteger(ml) || ml < 1 || ml > 2000) {
      setError('請輸入 1–2000 之間的整數');
      return;
    }
    setError(null);
    onAdd(ml);
    setValue('');
    setCustom(false);
  }

  return (
    <div className="quickadd">
      <div className="quickadd__row">
        {PRESETS.map((ml) => (
          <button
            key={ml}
            type="button"
            className="btn btn--primary quickadd__btn"
            onClick={() => onAdd(ml)}
            disabled={disabled}
          >
            <Drop />+{ml}
          </button>
        ))}
        <button
          type="button"
          className="btn btn--secondary quickadd__btn"
          onClick={() => setCustom((c) => !c)}
          disabled={disabled}
          aria-expanded={custom}
        >
          自訂
        </button>
      </div>

      {custom && (
        <div className="quickadd__custom">
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={2000}
            value={value}
            placeholder="毫升 (1–2000)"
            aria-label="自訂喝水量（毫升）"
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitCustom()}
            autoFocus
          />
          <button
            type="button"
            className="btn btn--primary"
            onClick={submitCustom}
            disabled={disabled}
          >
            加入
          </button>
        </div>
      )}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
