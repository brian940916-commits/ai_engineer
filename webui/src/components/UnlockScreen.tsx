import { useEffect } from 'react';
import type { PlantSkin } from '../types';
import { PlantView } from './PlantView';

// Full-screen celebration. When `skin` is given (streak milestone), it shows the
// newly-unlocked plant skin in bloom; otherwise (flower bloom) it's text-only.
// Auto-closes after 5s, or on tap.
interface Props {
  message: string;
  skin?: PlantSkin;
  onClose: () => void;
}

export function UnlockScreen({ message, skin, onClose }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="unlock" role="dialog" aria-live="assertive" onClick={onClose}>
      <div className="unlock__card">
        {skin && (
          <div className="unlock__art">
            <PlantView plant={{ stage: 'blooming', mood: 'happy', progress: 1 }} skin={skin} />
          </div>
        )}
        <p className="unlock__msg">{message}</p>
        <p className="unlock__hint">點擊任意處關閉</p>
      </div>
    </div>
  );
}
