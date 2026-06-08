import type { PlantMood, PlantStage } from '../types';

// All display copy is Traditional Chinese, per 08-design-brief.md. Tone: warm,
// encouraging, never shaming. Mood is also conveyed by the plant's face/posture,
// so these captions reinforce rather than replace the visual state.

export function greeting(nickname: string | null): string {
  const hour = new Date().getHours();
  const part = hour < 11 ? '早安' : hour < 18 ? '午安' : '晚安';
  const name = nickname ? `，${nickname}` : '';
  const emoji = hour < 11 ? '☀️' : hour < 18 ? '🌤️' : '🌙';
  return `${part}${name} ${emoji}`;
}

export const MOOD_CAPTION: Record<PlantMood, string> = {
  sleepy: '小植物在等你的第一杯水 💧',
  happy: '咕嚕咕嚕～小植物開心了！',
  ok: '小植物心情不錯！',
  thirsty: '小植物有點渴了，喝杯水吧',
  wilting: '小植物快撐不住了，快去喝水！',
};

export const STAGE_LABEL: Record<PlantStage, string> = {
  seed: '種子',
  sprout: '發芽',
  growing: '成長',
  budding: '含苞',
  blooming: '盛開',
};

export const MOOD_LABEL: Record<PlantMood, string> = {
  sleepy: '待澆水',
  happy: '開心',
  ok: '普通',
  thirsty: '口渴',
  wilting: '枯萎',
};

export const BLOOM_MESSAGE = '今天達標了，太棒了！🌸';
export const REMINDER_BODY = '你的小植物口渴了，喝杯水吧！🌱';
