import type { PlantMood } from '../types';

// Lines the plant says, by trigger × mood. A missing combination returns '' (no
// bubble shown). All copy is Traditional Chinese, matching the app's tone.
export type SpeechTrigger = 'onload' | 'afterDrink' | 'idle' | 'tap';

const SPEECH: Record<SpeechTrigger, Partial<Record<PlantMood, string[]>>> = {
  onload: {
    sleepy: ['今天的第一杯水呢？☁️', '還沒喝水……有點睡…', '早安～來杯水叫醒我吧 🌅'],
    happy: ['今天也要一起加油！🌟', '昨天喝好多！繼續！', '看到你真開心 💚'],
    ok: ['今天感覺不錯～', '記得隨時補水喔 💧', '我們慢慢來，穩穩的！'],
    thirsty: ['好渴……嗚嗚……💧', '快點…水…', '我的葉子都垂了啦～'],
    wilting: ['我快不行了…求你了…😭', '一滴水也好…拜託…', '別忘了我好嗎…🥀'],
  },
  afterDrink: {
    happy: ['咕嚕咕嚕！好喝！🎉', '謝謝你～愛你～', '元氣補滿！💪', '再多喝一點點？'],
    ok: ['嗯，不錯！繼續！', '棒棒棒！', '有感覺到水分了～', '這個節奏剛剛好 👍'],
    thirsty: ['啊…總算有水了…', '再多一點…拜託…'],
    wilting: ['得救了……謝謝你…🥹', '差點就枯掉了…'],
  },
  idle: {
    ok: ['有空再來看看我喔～', '你還在忙嗎？'],
    thirsty: ['你還在嗎……💧', '已經好久了……', '是不是忘記我了…'],
    wilting: ['好久沒喝水了…😢', '我在這裡等你…'],
  },
  tap: {
    sleepy: ['呼啊…被戳醒了…', '再讓我睡一下啦～', '嗯…？要喝水了嗎？'],
    happy: ['嘿嘿，被你發現了！', '今天狀態超好！', '要不要再來一杯？🥤', '戳我幹嘛啦～😆'],
    ok: ['有什麼事嗎？', '我很好喔！', '戳戳～癢癢的', '嗨！'],
    thirsty: ['趁現在…給我水…💧', '我在等水水…', '拜託拜託…一杯就好'],
    wilting: ['救命…水…😵', '我真的不行了…', '一滴水…求你…'],
  },
};

export function getPlantSpeech(mood: PlantMood, trigger: SpeechTrigger): string {
  const lines = SPEECH[trigger][mood];
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}
