import { useEffect, useRef, useState } from 'react';
import type { Plant, PlantMood, PlantStage } from '../types';
import { MOOD_LABEL, STAGE_LABEL } from '../lib/copy';

interface Props {
  plant: Plant;
}

// One illustration per growth STAGE (foliage), with MOOD applied as a face swap
// plus CSS treatment (droop / desaturation / overlays). This keeps it to ~5 core
// drawings instead of 25. Stage and mood always come from the API — never
// recomputed here (single source of truth, per 01-system-architecture.md).
export function PlantView({ plant }: Props) {
  const { stage, mood } = plant;
  const levelUp = useLevelUp(stage);

  return (
    <div
      className={[
        'plant',
        `plant--stage-${stage}`,
        `plant--mood-${mood}`,
        levelUp ? 'plant--levelup' : '',
      ]
        .join(' ')
        .trim()}
      role="img"
      aria-label={`小植物：${STAGE_LABEL[stage]}、${MOOD_LABEL[mood]}`}
    >
      <svg viewBox="0 0 200 240" className="plant__svg" aria-hidden="true">
        {/* ground shadow */}
        <ellipse cx="100" cy="232" rx="62" ry="9" className="plant__shadow" />

        {/* foliage (stage) — grows up out of the pot; droops on dry moods */}
        <g className="plant__foliage">{Foliage(stage)}</g>

        {/* pot (over the foliage base) */}
        <g className="plant__pot">
          <path
            className="pot"
            d="M58 168 L142 168 L132 224 Q131 230 124 230 L76 230 Q69 230 68 224 Z"
          />
          <rect className="pot-rim" x="50" y="150" width="100" height="22" rx="9" />
          <ellipse className="soil" cx="100" cy="156" rx="44" ry="7" />
        </g>

        {/* face (mood) on the pot belly */}
        <g className="plant__face">{Face(mood)}</g>

        {/* mood overlays */}
        {Overlays(mood)}
      </svg>
    </div>
  );
}

// --- Foliage per growth stage -------------------------------------------------

function Foliage(stage: PlantStage) {
  switch (stage) {
    case 'seed':
      return (
        <g>
          <path className="stem" d="M100 152 L100 142" />
          <ellipse className="leaf" cx="100" cy="138" rx="6" ry="10" />
        </g>
      );
    case 'sprout':
      return (
        <g>
          <path className="stem" d="M100 152 L100 120" />
          <ellipse className="leaf" cx="84" cy="120" rx="15" ry="9" transform="rotate(-32 84 120)" />
          <ellipse className="leaf" cx="116" cy="120" rx="15" ry="9" transform="rotate(32 116 120)" />
        </g>
      );
    case 'growing':
      return (
        <g>
          <path className="stem" d="M100 152 L100 92" />
          <ellipse className="leaf" cx="80" cy="138" rx="17" ry="10" transform="rotate(-30 80 138)" />
          <ellipse className="leaf" cx="120" cy="138" rx="17" ry="10" transform="rotate(30 120 138)" />
          <ellipse className="leaf" cx="78" cy="112" rx="18" ry="11" transform="rotate(-28 78 112)" />
          <ellipse className="leaf" cx="122" cy="112" rx="18" ry="11" transform="rotate(28 122 112)" />
          <ellipse className="leaf" cx="100" cy="90" rx="13" ry="18" />
        </g>
      );
    case 'budding':
      return (
        <g>
          <path className="stem" d="M100 152 L100 70" />
          <ellipse className="leaf" cx="78" cy="134" rx="18" ry="11" transform="rotate(-30 78 134)" />
          <ellipse className="leaf" cx="122" cy="134" rx="18" ry="11" transform="rotate(30 122 134)" />
          <ellipse className="leaf" cx="76" cy="108" rx="19" ry="11" transform="rotate(-26 76 108)" />
          <ellipse className="leaf" cx="124" cy="108" rx="19" ry="11" transform="rotate(26 124 108)" />
          {/* closed bud */}
          <path className="bud-sepal" d="M100 84 Q86 80 90 64 L110 64 Q114 80 100 84 Z" />
          <path className="bud" d="M100 76 Q88 66 100 48 Q112 66 100 76 Z" />
        </g>
      );
    case 'blooming':
      return (
        <g>
          <path className="stem" d="M100 152 L100 72" />
          <ellipse className="leaf" cx="78" cy="134" rx="18" ry="11" transform="rotate(-30 78 134)" />
          <ellipse className="leaf" cx="122" cy="134" rx="18" ry="11" transform="rotate(30 122 134)" />
          <ellipse className="leaf" cx="76" cy="108" rx="19" ry="11" transform="rotate(-26 76 108)" />
          <ellipse className="leaf" cx="124" cy="108" rx="19" ry="11" transform="rotate(26 124 108)" />
          {/* open flower */}
          <g className="flower">
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <ellipse
                key={deg}
                className="petal"
                cx="100"
                cy="46"
                rx="11"
                ry="18"
                transform={`rotate(${deg} 100 64)`}
              />
            ))}
            <circle className="flower-core" cx="100" cy="64" r="11" />
          </g>
        </g>
      );
  }
}

// --- Face per mood (eyes + mouth on the pot belly) ----------------------------

function Face(mood: PlantMood) {
  const eyesOpen = (
    <>
      <circle className="eye" cx="85" cy="190" r="4" />
      <circle className="eye" cx="115" cy="190" r="4" />
    </>
  );
  const eyesClosed = (
    <>
      <path className="eye-line" d="M79 190 Q85 195 91 190" />
      <path className="eye-line" d="M109 190 Q115 195 121 190" />
    </>
  );
  const eyesSad = (
    <>
      <circle className="eye" cx="85" cy="191" r="4" />
      <circle className="eye" cx="115" cy="191" r="4" />
      <path className="brow" d="M79 183 Q85 181 91 184" />
      <path className="brow" d="M109 184 Q115 181 121 183" />
    </>
  );

  switch (mood) {
    case 'sleepy':
      return (
        <>
          {eyesClosed}
          <path className="mouth" d="M94 202 Q100 206 106 202" />
        </>
      );
    case 'happy':
      return (
        <>
          {eyesOpen}
          <path className="mouth" d="M86 200 Q100 213 114 200" />
        </>
      );
    case 'ok':
      return (
        <>
          {eyesOpen}
          <path className="mouth" d="M91 202 Q100 208 109 202" />
        </>
      );
    case 'thirsty':
      return (
        <>
          {eyesOpen}
          <path className="brow" d="M79 184 Q85 182 91 184" />
          <path className="brow" d="M109 184 Q115 182 121 184" />
          <path className="mouth" d="M92 204 Q96 201 100 204 Q104 207 108 204" />
        </>
      );
    case 'wilting':
      return (
        <>
          {eyesSad}
          <path className="mouth" d="M89 206 Q100 198 111 206" />
        </>
      );
  }
}

// --- Mood overlays ------------------------------------------------------------

function Overlays(mood: PlantMood) {
  switch (mood) {
    case 'sleepy':
      return (
        <text className="overlay-zzz" x="138" y="150">
          Z z z
        </text>
      );
    case 'happy':
      return (
        <>
          <Sparkle x={150} y={96} s={1} />
          <path className="droplet" d="M150 168 q7 9 0 14 q-7 -5 0 -14 Z" />
        </>
      );
    case 'thirsty':
      return <path className="sweat" d="M128 182 q5 7 0 11 q-5 -4 0 -11 Z" />;
    case 'wilting':
      return (
        <g className="overlay-alert">
          <circle cx="146" cy="146" r="13" />
          <text x="146" y="152">
            ！
          </text>
        </g>
      );
    case 'ok':
      return null;
  }
}

function Sparkle({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <path
      className="sparkle"
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 -9 Q1.5 -1.5 9 0 Q1.5 1.5 0 9 Q-1.5 1.5 -9 0 Q-1.5 -1.5 0 -9 Z"
    />
  );
}

// Briefly flag a stage change so CSS can play a grow-bounce reward.
function useLevelUp(stage: PlantStage): boolean {
  const prev = useRef(stage);
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (prev.current !== stage) {
      prev.current = stage;
      setActive(true);
      const t = window.setTimeout(() => setActive(false), 700);
      return () => clearTimeout(t);
    }
  }, [stage]);
  return active;
}
