import type { PlantMood } from '../types';

// Lines the plant says, by trigger × mood. A missing combination returns '' (no
// bubble shown). All copy is Traditional Chinese, matching the app's tone.
export type SpeechTrigger = 'onload' | 'afterDrink' | 'idle';

const SPEECH: Record<SpeechTrigger, Partial<Record<PlantMood, string[]>>> = {
  onload: {
    sleepy: ['今天的第一杯水呢？☁️', '還沒喝水……有點睡…'],
    happy: ['今天也要一起加油！🌟', '昨天喝好多！繼續！'],
    thirsty: ['好渴……嗚嗚……💧', '快點…水…'],
    wilting: ['我快不行了…求你了…😭'],
  },
  afterDrink: {
    happy: ['咕嚕咕嚕！好喝！🎉', '謝謝你～愛你～'],
    ok: ['嗯，不錯！繼續！', '棒棒棒！'],
  },
  idle: {
    thirsty: ['你還在嗎……💧', '已經好久了……'],
  },
};

export function getPlantSpeech(mood: PlantMood, trigger: SpeechTrigger): string {
  const lines = SPEECH[trigger][mood];
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}
