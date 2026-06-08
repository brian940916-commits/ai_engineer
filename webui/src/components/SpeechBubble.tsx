import { useEffect, useState } from 'react';

// A transient speech bubble above the plant: enter (0.3s) → stay (2.5s) →
// exit (0.25s), then it asks to be unmounted. Remount with a new `key` to replay.
interface Props {
  text: string;
  onClose: () => void;
}

export function SpeechBubble({ text, onClose }: Props) {
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const toExit = window.setTimeout(() => setClosing(true), 2800); // 0.3 enter + 2.5 stay
    const toClose = window.setTimeout(onClose, 3050); // + 0.25 exit
    return () => {
      clearTimeout(toExit);
      clearTimeout(toClose);
    };
  }, [onClose]);

  return (
    <div className={`speech-bubble${closing ? ' is-closing' : ''}`} role="status" aria-live="polite">
      {text}
    </div>
  );
}
