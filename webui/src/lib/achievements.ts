import type { PlantSkin } from '../types';

// Streak milestones unlock a special plant skin AND, in parallel, rarer flower
// species in the garden (the flower pool is gated by streak in lib/garden.ts).
// unlockMsg is shown once on the UnlockScreen the first time the milestone is
// reached — it mentions both rewards.
export interface Milestone {
  days: number;
  label: string;
  unlockMsg: string;
  skin: Exclude<PlantSkin, 'default'>;
}

export const MILESTONES: Milestone[] = [
  {
    days: 3,
    label: '初心者',
    unlockMsg: '連續達標3天！花朵學會了發光 ✨\n稀有花種開始出現：櫻花、芙蓉 🌸',
    skin: 'glow',
  },
  {
    days: 7,
    label: '認真喝水',
    unlockMsg: '連續7天！花朵變成金色了 🌟\n更稀有的花種現身：蓮花、蘭花 🪷',
    skin: 'gold',
  },
  {
    days: 14,
    label: '喝水達人',
    unlockMsg: '連續14天！彩虹花朵覺醒！ 🌈\n傳說花種覺醒：彩虹花 🌈',
    skin: 'rainbow',
  },
  {
    days: 30,
    label: '傳說水神',
    unlockMsg: '連續30天！你是傳說中的水神 👑',
    skin: 'legend',
  },
];

const UNLOCK_KEY = 'plantBuddyUnlocked';
const TIER: PlantSkin[] = ['default', 'glow', 'gold', 'rainbow', 'legend'];

export function readUnlockedSkins(): PlantSkin[] {
  try {
    const arr = JSON.parse(localStorage.getItem(UNLOCK_KEY) ?? '[]');
    return Array.isArray(arr) ? (arr as PlantSkin[]) : [];
  } catch {
    return [];
  }
}

export function writeUnlockedSkins(skins: PlantSkin[]): void {
  localStorage.setItem(UNLOCK_KEY, JSON.stringify(skins));
}

// The highest-tier skin among those unlocked (so the trophy persists once earned).
export function highestSkin(unlocked: PlantSkin[]): PlantSkin {
  let best: PlantSkin = 'default';
  for (const s of unlocked) {
    if (TIER.indexOf(s) > TIER.indexOf(best)) best = s;
  }
  return best;
}
