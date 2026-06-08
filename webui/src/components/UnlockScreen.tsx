import { useEffect } from 'react';

// Full-screen milestone / bloom celebration: plain message + emoji. Auto-closes
// after 5s, or on tap.
interface Props {
  message: string;
  onClose: () => void;
}

export function UnlockScreen({ message, onClose }: Props) {
  useEffect(() => {
    const t = window.setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  // message 格式可能是 "🌸 櫻花盛開了！\n少見花種收入花田 🌸"
  // 或里程碑訊息 "連續3天達標！稀有花種開始出現：櫻花、芙蓉 🌸"
  return (
    <div className="unlock" role="dialog" aria-live="assertive" onClick={onClose}>
      <div className="unlock__card">
        <p className="unlock__msg">{message}</p>
        <p className="unlock__hint">點擊任意處關閉</p>
      </div>
    </div>
  );
}
