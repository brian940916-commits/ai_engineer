import type { JSX } from 'react';
import type { Plant, PlantMood, PlantStage } from '../types';
import { MOOD_LABEL, STAGE_LABEL } from '../lib/copy';

// Faithful port of the design handoff's PlantSVG (plant-buddy-plants.jsx):
// a potted plant character, 5 growth stages × 5 moods. Stage = foliage,
// mood = face + CSS filter + leaf droop. stage/mood come from the API and are
// never recomputed here (single source of truth, per 01-system-architecture.md).

const C = {
  leafGreen: '#5FB98E',
  leafDark: '#3D9B70',
  leafMuted: '#AECA9B',
  stemGreen: '#4AAF7A',
  stemMuted: '#90A880',
  potTerra: '#E0A07A',
  potRim: '#E8B090',
  potShadow: '#C07850',
  soil: '#7A5040',
  soilLight: '#9A6850',
  eye: '#4A4039',
  muted: '#9A9087',
  flowerPink: '#F890A8',
  flowerLight: '#FDB5C8',
  flowerGold: '#F6C95B',
  flowerAmber: '#F6A030',
  budPink: '#F4B0C4',
  budDeep: '#F090AA',
  water: '#6FC8E0',
  sun: '#F6C95B',
  alert: '#E8907C',
};

interface Props {
  plant: Plant;
}

export function PlantView({ plant }: Props) {
  return (
    <div
      role="img"
      aria-label={`小植物：${STAGE_LABEL[plant.stage]}、${MOOD_LABEL[plant.mood]}`}
      style={{ width: '100%', height: '100%' }}
    >
      <PlantSVG stage={plant.stage} mood={plant.mood} />
    </div>
  );
}

function PlantSVG({ stage, mood }: { stage: PlantStage; mood: PlantMood }) {
  const wilting = mood === 'wilting';
  const thirsty = mood === 'thirsty';
  const sleepy = mood === 'sleepy';
  const happy = mood === 'happy';

  const lf = wilting ? C.leafMuted : C.leafGreen;
  const ld = wilting ? '#8CAA7C' : C.leafDark;
  const st = wilting ? C.stemMuted : C.stemGreen;
  const droop = wilting ? 18 : thirsty ? 9 : 0;

  const svgFilter = wilting
    ? 'saturate(42%) sepia(18%)'
    : sleepy
      ? 'saturate(70%) brightness(95%)'
      : 'none';

  const Pot = () => (
    <g>
      <rect x="16" y="114" width="88" height="11" rx="5.5" fill={C.potRim} />
      <path d="M22,125 L29,161 Q60,168 91,161 L98,125 Z" fill={C.potTerra} />
      <path d="M87,126 L92,160 Q98,156 98,126Z" fill={C.potShadow} opacity="0.18" />
      <path d="M22,126 L25,148 Q22.5,137 22,126Z" fill="white" opacity="0.12" />
      <ellipse cx="60" cy="115" rx="37" ry="7" fill={C.soil} />
      <ellipse cx="57" cy="113" rx="28" ry="4.5" fill={C.soilLight} opacity="0.5" />
      <circle cx="46" cy="116" r="2" fill={C.soil} opacity="0.35" />
      <circle cx="73" cy="115" r="1.5" fill={C.soil} opacity="0.3" />
    </g>
  );

  const Face = ({ cx = 60, cy = 75, s = 1 }: { cx?: number; cy?: number; s?: number }) => {
    const e1 = cx - 6 * s;
    const e2 = cx + 6 * s;
    const ey = cy;
    const my = cy + 5.5 * s;
    const ec = C.eye;
    if (sleepy)
      return (
        <g>
          <path d={`M${e1 - 3 * s},${ey} Q${e1},${ey - 2 * s} ${e1 + 3 * s},${ey}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
          <path d={`M${e2 - 3 * s},${ey} Q${e2},${ey - 2 * s} ${e2 + 3 * s},${ey}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx - 4 * s},${my} Q${cx},${my + 3 * s} ${cx + 4 * s},${my}`} stroke={ec} strokeWidth={1.5 * s} fill="none" strokeLinecap="round" />
        </g>
      );
    if (happy)
      return (
        <g>
          <circle cx={e1} cy={ey} r={2.5 * s} fill={ec} />
          <circle cx={e1 + 0.8 * s} cy={ey - 0.8 * s} r={0.8 * s} fill="white" />
          <circle cx={e2} cy={ey} r={2.5 * s} fill={ec} />
          <circle cx={e2 + 0.8 * s} cy={ey - 0.8 * s} r={0.8 * s} fill="white" />
          <path d={`M${cx - 6 * s},${my} Q${cx},${my + 5 * s} ${cx + 6 * s},${my}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
        </g>
      );
    if (thirsty)
      return (
        <g>
          <path d={`M${e1 - 3 * s},${ey - 1.5 * s} L${e1},${ey + 1.5 * s} L${e1 + 3 * s},${ey - 1.5 * s}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${e2 - 3 * s},${ey - 1.5 * s} L${e2},${ey + 1.5 * s} L${e2 + 3 * s},${ey - 1.5 * s}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={`M${cx - 4 * s},${my + 1 * s} Q${cx},${my - 1 * s} ${cx + 4 * s},${my + 1 * s}`} stroke={ec} strokeWidth={1.5 * s} fill="none" strokeLinecap="round" />
        </g>
      );
    if (wilting)
      return (
        <g>
          <path d={`M${e1 - 3 * s},${ey + 2 * s} Q${e1},${ey - 0.5 * s} ${e1 + 3 * s},${ey + 2 * s}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
          <path d={`M${e2 - 3 * s},${ey + 2 * s} Q${e2},${ey - 0.5 * s} ${e2 + 3 * s},${ey + 2 * s}`} stroke={ec} strokeWidth={1.8 * s} fill="none" strokeLinecap="round" />
          <path d={`M${cx - 5 * s},${my + 2 * s} Q${cx},${my - 1 * s} ${cx + 5 * s},${my + 2 * s}`} stroke={ec} strokeWidth={1.5 * s} fill="none" strokeLinecap="round" />
        </g>
      );
    // ok / default
    return (
      <g>
        <circle cx={e1} cy={ey} r={2 * s} fill={ec} />
        <circle cx={e2} cy={ey} r={2 * s} fill={ec} />
        <path d={`M${cx - 4.5 * s},${my} Q${cx},${my + 3.5 * s} ${cx + 4.5 * s},${my}`} stroke={ec} strokeWidth={1.5 * s} fill="none" strokeLinecap="round" />
      </g>
    );
  };

  const Overlay = ({ cx = 60, cy = 75 }: { cx?: number; cy?: number }) => {
    if (sleepy)
      return (
        <g opacity="0.8">
          <text x={cx + 13} y={cy - 17} fontSize="9" fill={C.muted} fontFamily="sans-serif">z</text>
          <text x={cx + 18} y={cy - 26} fontSize="7" fill={C.muted} fontFamily="sans-serif" opacity="0.8">z</text>
          <text x={cx + 22} y={cy - 34} fontSize="5.5" fill={C.muted} fontFamily="sans-serif" opacity="0.6">z</text>
        </g>
      );
    if (thirsty)
      return (
        <g>
          <path d={`M${cx + 14},${cy + 2} Q${cx + 17},${cy + 7} ${cx + 14},${cy + 11} Q${cx + 11},${cy + 11} ${cx + 11},${cy + 7} Q${cx + 11},${cy + 2} ${cx + 14},${cy + 2}Z`} fill={C.water} opacity="0.8" />
          <ellipse cx={cx + 12.5} cy={cy + 6} rx="1" ry="1.5" fill="white" opacity="0.5" />
        </g>
      );
    if (wilting)
      return (
        <text x={cx - 5} y={cy - 22} fontSize="16" fill={C.alert} fontWeight="bold" fontFamily="sans-serif" opacity="0.85">!</text>
      );
    if (stage === 'blooming')
      return (
        <g>
          <path d="M28,26 L29,22 L30,26 L26,24 L32,24Z" fill={C.sun} opacity="0.9" />
          <path d="M93,30 L94,26 L95,30 L91,28 L97,28Z" fill={C.sun} opacity="0.8" />
          <circle cx="22" cy="42" r="2.5" fill={C.water} opacity="0.7" />
          <circle cx="99" cy="35" r="2" fill={C.flowerPink} opacity="0.7" />
          <circle cx="14" cy="56" r="1.5" fill={C.sun} opacity="0.55" />
          <circle cx="107" cy="59" r="1.5" fill={C.water} opacity="0.55" />
        </g>
      );
    if (happy && stage === 'budding')
      return (
        <g>
          <path d="M24,56 L25,52 L26,56 L22,54 L28,54Z" fill={C.sun} opacity="0.8" />
          <circle cx="97" cy="62" r="2" fill={C.water} opacity="0.65" />
        </g>
      );
    return null;
  };

  const LowerLeaves = ({ y = 108, big = false }: { y?: number; big?: boolean }) => {
    const o = big ? 4 : 0;
    return (
      <>
        <g style={{ transformOrigin: `60px ${y}px`, transform: `rotate(${-droop * 0.9}deg)` }}>
          <path d={`M60,${y} C${40 - o},${y - 12} ${24 - o},${y - 8} ${26 - o},${y + 4} C${28 - o},${y + 16} ${50 - o},${y + 12} 60,${y}Z`} fill={lf} />
        </g>
        <g style={{ transformOrigin: `60px ${y}px`, transform: `rotate(${droop * 0.9}deg)` }}>
          <path d={`M60,${y} C${80 + o},${y - 12} ${96 + o},${y - 8} ${94 + o},${y + 4} C${92 + o},${y + 16} ${70 + o},${y + 12} 60,${y}Z`} fill={lf} />
        </g>
      </>
    );
  };

  const UpperLeaves = ({ y = 84 }: { y?: number }) => (
    <>
      <g style={{ transformOrigin: `60px ${y}px`, transform: `rotate(${-droop * 0.4}deg)` }}>
        <path d={`M59,${y + 1} C46,${y - 11} 34,${y - 9} 36,${y + 3} C38,${y + 15} 54,${y + 11} 59,${y + 1}Z`} fill={lf} />
      </g>
      <g style={{ transformOrigin: `60px ${y}px`, transform: `rotate(${droop * 0.4}deg)` }}>
        <path d={`M61,${y + 1} C74,${y - 11} 86,${y - 9} 84,${y + 3} C82,${y + 15} 66,${y + 11} 61,${y + 1}Z`} fill={lf} />
      </g>
    </>
  );

  const renderBody = (): JSX.Element | null => {
    switch (stage) {
      case 'seed':
        return (
          <>
            <ellipse cx="60" cy="110" rx="14" ry="10.5" fill={lf} />
            <ellipse cx="57" cy="108" rx="6" ry="4" fill={ld} opacity="0.15" />
            <Face cx={60} cy={103} />
            <Overlay cx={60} cy={103} />
          </>
        );
      case 'sprout':
        return (
          <>
            <line x1="60" y1="115" x2="60" y2="96" stroke={st} strokeWidth="3" strokeLinecap="round" />
            <g style={{ transformOrigin: '60px 107px', transform: `rotate(${-droop}deg)` }}>
              <path d="M60,101 C48,89 34,89 36,99 C38,109 52,106 60,101Z" fill={lf} />
              <path d="M60,101 C51,97 39,96 36,99" stroke={ld} strokeWidth="0.7" fill="none" opacity="0.4" />
            </g>
            <g style={{ transformOrigin: '60px 107px', transform: `rotate(${droop}deg)` }}>
              <path d="M60,101 C72,89 86,89 84,99 C82,109 68,106 60,101Z" fill={lf} />
              <path d="M60,101 C69,97 81,96 84,99" stroke={ld} strokeWidth="0.7" fill="none" opacity="0.4" />
            </g>
            <Face cx={60} cy={89} />
            <Overlay cx={60} cy={89} />
          </>
        );
      case 'growing':
        return (
          <>
            <line x1="60" y1="115" x2="60" y2="75" stroke={st} strokeWidth="3.5" strokeLinecap="round" />
            <g style={{ transformOrigin: '60px 103px', transform: `rotate(${-droop * 0.8}deg)` }}>
              <path d="M60,106 C42,97 28,102 30,114 C32,125 50,121 60,106Z" fill={ld} opacity="0.28" />
            </g>
            <g style={{ transformOrigin: '60px 103px', transform: `rotate(${droop * 0.8}deg)` }}>
              <path d="M60,106 C78,97 92,102 90,114 C88,125 70,121 60,106Z" fill={ld} opacity="0.28" />
            </g>
            <g style={{ transformOrigin: '60px 93px', transform: `rotate(${-droop * 0.6}deg)` }}>
              <path d="M59,96 C44,83 30,85 32,97 C34,109 52,106 59,96Z" fill={lf} />
              <path d="M59,96 C48,91 36,91 32,97" stroke={ld} strokeWidth="0.8" fill="none" opacity="0.35" />
            </g>
            <g style={{ transformOrigin: '60px 93px', transform: `rotate(${droop * 0.6}deg)` }}>
              <path d="M61,96 C76,83 90,85 88,97 C86,109 68,106 61,96Z" fill={lf} />
              <path d="M61,96 C72,91 84,91 88,97" stroke={ld} strokeWidth="0.8" fill="none" opacity="0.35" />
            </g>
            <g style={{ transformOrigin: '60px 82px', transform: `rotate(${droop * 0.3}deg)` }}>
              <path d="M60,83 C52,69 56,57 60,57 C64,57 68,69 60,83Z" fill={lf} />
              <line x1="60" y1="81" x2="60" y2="59" stroke={ld} strokeWidth="0.8" opacity="0.35" />
            </g>
            <Face cx={60} cy={73} />
            <Overlay cx={60} cy={73} />
          </>
        );
      case 'budding':
        return (
          <>
            <line x1="60" y1="115" x2="60" y2="60" stroke={st} strokeWidth="3.5" strokeLinecap="round" />
            <LowerLeaves y={108} big={true} />
            <UpperLeaves y={84} />
            <ellipse cx="60" cy="53" rx="9" ry="14" fill={C.budPink} />
            <ellipse cx="60" cy="51" rx="5.5" ry="9" fill={C.budDeep} opacity="0.4" />
            <path d="M60,64 C52,63 48,56 52,53 C56,50 60,55 60,64Z" fill={lf} opacity="0.85" />
            <path d="M60,64 C68,63 72,56 68,53 C64,50 60,55 60,64Z" fill={lf} opacity="0.85" />
            <Face cx={60} cy={68} />
            <Overlay cx={60} cy={68} />
          </>
        );
      case 'blooming':
        return (
          <>
            <line x1="60" y1="115" x2="60" y2="60" stroke={st} strokeWidth="3.5" strokeLinecap="round" />
            <LowerLeaves y={108} big={true} />
            <UpperLeaves y={84} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const px = 60 + 15 * Math.cos(rad);
              const py = 42 + 15 * Math.sin(rad);
              return (
                <ellipse key={i} cx={px} cy={py} rx="8" ry="11" fill={i % 2 === 0 ? C.flowerPink : C.flowerLight} transform={`rotate(${deg},${px},${py})`} />
              );
            })}
            <circle cx="60" cy="42" r="12" fill={C.flowerGold} />
            <circle cx="60" cy="42" r="8" fill={C.flowerAmber} />
            <Face cx={60} cy={42} s={0.82} />
            <Overlay cx={60} cy={42} />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <svg
      viewBox="0 0 120 180"
      style={{ filter: svgFilter, overflow: 'visible', display: 'block', width: '100%', height: '100%' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <Pot />
      {renderBody()}
    </svg>
  );
}
