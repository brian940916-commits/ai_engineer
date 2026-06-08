// 連續達標里程碑：解鎖更稀有的花種（取代原本的植物外觀 skin）
export interface StreakMilestone {
  days: number;
  message: string;
  unlockedRarity: 'uncommon' | 'rare' | 'legendary';
}

export const STREAK_MILESTONES: StreakMilestone[] = [
  {
    days: 3,
    message: '連續3天達標！稀有花種開始出現：櫻花、芙蓉 🌸',
    unlockedRarity: 'uncommon',
  },
  {
    days: 7,
    message: '連續7天！更稀有的花種現身：蓮花、蘭花 🪷',
    unlockedRarity: 'rare',
  },
  {
    days: 14,
    message: '連續14天！傳說花種覺醒：彩虹花 🌈',
    unlockedRarity: 'legendary',
  },
];

const MILESTONE_KEY = 'plantBuddyStreakMilestone';

export function readUnlockedMilestones(): number[] {
  try {
    const arr = JSON.parse(localStorage.getItem(MILESTONE_KEY) ?? '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

export function writeUnlockedMilestones(days: number[]): void {
  localStorage.setItem(MILESTONE_KEY, JSON.stringify(days));
}
