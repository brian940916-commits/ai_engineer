export type PlantStage = 'seed' | 'sprout' | 'growing' | 'budding' | 'blooming';
export type PlantMood = 'sleepy' | 'happy' | 'ok' | 'thirsty' | 'wilting';
export type PlantSkin = 'default' | 'glow' | 'gold' | 'rainbow' | 'legend';

export interface Plant {
  stage: PlantStage;
  mood: PlantMood;
  progress: number; // 0.0+
}

export interface Profile {
  nickname: string | null;
  goalMl: number;
}

export interface DrinkEntry {
  ml: number;
  at: string; // ISO 8601，例如 "2026-06-09T08:32:10Z"
}

export interface Today {
  date: string;
  totalMl: number;
  drinkCount: number;
  lastDrinkAt: string | null;
  entries: DrinkEntry[];
}

export interface HistoryDay {
  date: string;
  totalMl: number;
  goalMl: number;
  progress: number;
}

export interface StatusResponse {
  profile: Profile;
  today: Today;
  plant: Plant;
  history: HistoryDay[];
}

export interface RecordResponse {
  date: string;
  totalMl: number;
  goalMl: number;
  drinkCount: number;
  lastDrinkAt: string;
  plant: Plant;
}

export type Screen = 'home' | 'settings';
