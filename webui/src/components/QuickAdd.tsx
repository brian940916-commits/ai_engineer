import { useState } from 'react';

interface Props {
  onAdd: (amountMl: number) => void;
  disabled?: boolean;
}

// Quick-record row + custom amount. Recreated from the design handoff's QuickAdd.
export function QuickAdd({ onAdd, disabled }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [val, setVal] = useState('');

  const submit = () => {
    const n = parseInt(val, 10);
    if (n > 0 && n <= 2000) {
      onAdd(n);
      setVal('');
      setShowCustom(false);
    }
  };

  return (
    <div>
      <div className="section-label">快速記錄</div>
      <div className="qa-row">
        {[200, 300, 500].map((ml) => (
          <button key={ml} className="add-btn" onClick={() => onAdd(ml)} disabled={disabled}>
            💧 +{ml}
          </button>
        ))}
        <button
          className={`add-btn ${showCustom ? 'active-custom' : ''}`}
          onClick={() => setShowCustom((v) => !v)}
          disabled={disabled}
          aria-expanded={showCustom}
        >
          自訂
        </button>
      </div>
      {showCustom && (
        <div className="qa-custom">
          <input
            className="custom-input"
            type="number"
            inputMode="numeric"
            placeholder="輸入 ml"
            min={1}
            max={2000}
            value={val}
            autoFocus
            aria-label="自訂喝水量（毫升）"
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <button className="confirm-btn" onClick={submit} disabled={disabled}>
            確認
          </button>
        </div>
      )}
    </div>
  );
}
