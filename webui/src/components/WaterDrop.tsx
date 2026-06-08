import { Fragment, useState } from 'react';

// Water-drop splash played on every "drink" tap (fired optimistically, before the
// API responds). 3–5 drops fall from above the plant onto the pot, each leaving a
// small ripple. HomeScreen mounts this and unmounts it after ~950ms.
interface Drop {
  id: number;
  x: number; // horizontal offset from plant centre, px
  delay: number; // seconds
}

function makeDrops(): Drop[] {
  const count = 3 + Math.floor(Math.random() * 3); // 3–5
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 60 - 30, // ±30px
    delay: Math.random() * 0.18,
  }));
}

export function WaterDrop() {
  const [drops] = useState(makeDrops);

  return (
    <div className="water-drops" aria-hidden="true">
      {drops.map((d) => {
        const dropStyle = { '--x': `${d.x}px`, '--delay': `${d.delay}s` } as React.CSSProperties;
        const rippleStyle = {
          '--x': `${d.x}px`,
          '--ripple-delay': `${(d.delay + 0.5).toFixed(2)}s`,
        } as React.CSSProperties;
        return (
          <Fragment key={d.id}>
            <div className="water-drop" style={dropStyle}>
              <svg width="14" height="18" viewBox="0 0 14 18">
                <path d="M7 1 C7 1 12 8 12 12 A5 5 0 1 1 2 12 C2 8 7 1 7 1 Z" fill="#6FC8E0" />
              </svg>
            </div>
            <div className="water-ripple" style={rippleStyle} />
          </Fragment>
        );
      })}
    </div>
  );
}
