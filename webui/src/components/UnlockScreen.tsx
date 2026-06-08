import { useEffect } from 'react';
import type { PlantSkin } from '../types';
import { PlantView } from './PlantView';

// Full-screen milestone celebration: shows the newly-unlocked skin in bloom plus
// the unlock message. Auto-closes after 5s, or on tap.
interface Props {
  skin: PlantSkin;
  message: string;
  onClose: () => void;
}

export function UnlockScreen({ skin, message, onClose }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="unlock" role="dialog" aria-live="assertive" onClick={onClose}>
      <div className="unlock__card">
        <div className="unlock__art">
          <PlantView plant={{ stage: 'blooming', mood: 'happy', progress: 1 }} skin={skin} />
        </div>
        <p className="unlock__msg">{message}</p>
        <p className="unlock__hint">點擊任意處關閉</p>
      </div>
    </div>
  );
}
