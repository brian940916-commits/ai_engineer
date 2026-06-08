export type FlowerRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export interface FlowerSpecies {
  id: string;
  name: string;
  emoji: string;
  rarity: FlowerRarity;
  unlockStreakDays: number; // 0=common, 3=uncommon, 7=rare, 14=legendary
}

export interface GardenEntry {
  date: string;       // YYYY-MM-DD
  speciesId: string;
  metGoal: boolean;
}

export const FLOWER_SPECIES: FlowerSpecies[] = [
  { id: 'daisy',     name: '雛菊',   emoji: '🌼', rarity: 'common',    unlockStreakDays: 0  },
  { id: 'tulip',     name: '鬱金香', emoji: '🌷', rarity: 'common',    unlockStreakDays: 0  },
  { id: 'rose',      name: '玫瑰',   emoji: '🌹', rarity: 'common',    unlockStreakDays: 0  },
  { id: 'sunflower', name: '向日葵', emoji: '🌻', rarity: 'common',    unlockStreakDays: 0  },
  { id: 'cherry',    name: '櫻花',   emoji: '🌸', rarity: 'uncommon',  unlockStreakDays: 3  },
  { id: 'hibiscus',  name: '芙蓉',   emoji: '🌺', rarity: 'uncommon',  unlockStreakDays: 3  },
  { id: 'lotus',     name: '蓮花',   emoji: '🪷', rarity: 'rare',      unlockStreakDays: 7  },
  { id: 'orchid',    name: '蘭花',   emoji: '💮', rarity: 'rare',      unlockStreakDays: 7  },
  { id: 'rainbow',   name: '彩虹花', emoji: '🌈', rarity: 'legendary', unlockStreakDays: 14 },
];

const GARDEN_KEY = 'plantBuddyGarden';

// 簡易 hash，讓同一天永遠對應同一朵花
function hashDate(date: string): number {
  return date.split('').reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
}

// 依 currentStreak 決定可用花種池，用日期 hash 選花
// 若今天已有記錄則不覆蓋，直接回傳已分配的花
export function assignTodayFlower(today: string, currentStreak: number): FlowerSpecies {
  const garden = readGarden();
  const existing = garden.find(e => e.date === today);
  if (existing) {
    return FLOWER_SPECIES.find(f => f.id === existing.speciesId) ?? FLOWER_SPECIES[0];
  }
  const pool = FLOWER_SPECIES.filter(f => f.unlockStreakDays <= currentStreak);
  const species = pool[Math.abs(hashDate(today)) % pool.length];
  const newEntry: GardenEntry = { date: today, speciesId: species.id, metGoal: false };
  localStorage.setItem(GARDEN_KEY, JSON.stringify([...garden, newEntry]));
  return species;
}

// 達標時呼叫，把今天的花設為 metGoal: true
export function bloomTodayFlower(today: string): void {
  const garden = readGarden();
  const updated = garden.map(e => e.date === today ? { ...e, metGoal: true } : e);
  localStorage.setItem(GARDEN_KEY, JSON.stringify(updated));
}

// 讀取所有花田記錄，依日期降序
export function readGarden(): GardenEntry[] {
  try {
    const arr = JSON.parse(localStorage.getItem(GARDEN_KEY) ?? '[]');
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

// 今天是否已達標（已 bloom）
export function isTodayBloomed(today: string): boolean {
  return readGarden().some(e => e.date === today && e.metGoal);
}

export const RARITY_LABEL: Record<FlowerRarity, string> = {
  common: '普通',
  uncommon: '少見',
  rare: '稀有',
  legendary: '傳說',
};

export const RARITY_STARS: Record<FlowerRarity, string> = {
  common: '★',
  uncommon: '★★',
  rare: '★★★',
  legendary: '★★★★',
};
