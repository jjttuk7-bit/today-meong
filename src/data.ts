import { ThemeOption, MoodOption } from "./types";

export const THEME_OPTIONS: ThemeOption[] = [
  // ── 자연멍 (Nature) ──────────────────────────────
  {
    id: "fire",
    category: "nature",
    name: "불멍",
    englishName: "Fire Gazing",
    iconName: "Flame",
    description: "타오르는 붉은 불꽃과 타닥타닥 소리",
    englishDescription: "Soothe your mind with crackling woodfire flames",
    gradient: "from-amber-600 via-orange-500 to-stone-900",
    defaultColors: ["#fc4a1a", "#f7b733", "#1f0502"],
  },
  {
    id: "water",
    category: "nature",
    name: "물멍",
    englishName: "Water Flow",
    iconName: "Droplet",
    description: "잔잔한 수면 아래 푸른 흐름과 숨소리",
    englishDescription: "Immerse in deep, tranquil, sub-aquatic blue streams",
    gradient: "from-blue-600 via-cyan-500 to-slate-900",
    defaultColors: ["#00c6ff", "#0072ff", "#020d1c"],
  },
  {
    id: "wave",
    category: "nature",
    name: "파도멍",
    englishName: "Ocean Waves",
    iconName: "Waves",
    description: "끝없이 밀려들고 부서지는 밤바다 파도",
    englishDescription: "Pace your breathing with rhythmic coastal tide beats",
    gradient: "from-teal-600 via-emerald-500 to-indigo-950",
    defaultColors: ["#141e30", "#243b55", "#02050c"],
  },
  {
    id: "cloud",
    category: "nature",
    name: "구름멍",
    englishName: "Cloud Drift",
    iconName: "Cloud",
    description: "광활한 하늘을 아주 느리게 유영하는 구름",
    englishDescription: "Float seamlessly amidst drifting celestial fog skies",
    gradient: "from-indigo-600 via-purple-500 to-slate-950",
    defaultColors: ["#312e81", "#1e1b4b", "#030712"],
  },
  {
    id: "rain",
    category: "nature",
    name: "비멍",
    englishName: "Raindrops",
    iconName: "CloudRain",
    description: "창가를 때리는 소박한 빗방울과 빗소리",
    englishDescription: "Relax with cozy, persistent ambient rain on windows",
    gradient: "from-slate-600 via-blue-500 to-stone-950",
    defaultColors: ["#3a6073", "#141e30", "#050c12"],
  },

  // ── 한국멍 (Korean) ──────────────────────────────
  {
    id: "sansa",
    category: "korean",
    name: "산사멍",
    englishName: "Temple at Dawn",
    iconName: "Sansa",
    description: "새벽 안개 속 산사, 풍경 소리에 마음을 비웁니다",
    englishDescription: "Empty your mind to the sound of wind bells in a misty mountain temple",
    gradient: "from-amber-900 via-purple-950 to-slate-950",
    defaultColors: ["#0a0618", "#2d1b4e", "#1a0f02"],
  },
];

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: "stress",
    name: "스트레스",
    englishName: "Stressful",
    emoji: "🥵",
    description: "생각이 너무 많고 지친 마음",
    englishDescription: "Overwhelmed mind seeking a quiet reset",
  },
  {
    id: "calm",
    name: "평온",
    englishName: "Calm",
    emoji: "😌",
    description: "조용히 깊은 휴식을 취하고 싶을 때",
    englishDescription: "Desiring a slow, cozy moment of rest",
  },
  {
    id: "anxiety",
    name: "불안",
    englishName: "Anxious",
    emoji: "😰",
    description: "가슴이 서먹하고 가라앉히고 싶을 때",
    englishDescription: "Seeking safety and emotional grounding",
  },
  {
    id: "lethargy",
    name: "무기력",
    englishName: "Lethargic",
    emoji: "😴",
    description: "몸도 마음도 아무것도 할 수 없을 때",
    englishDescription: "Low on battery, needing gentle revitalization",
  },
  {
    id: "excitement",
    name: "설렘",
    englishName: "Excited",
    emoji: "🥰",
    description: "감정이 두근거려 차분히 정돈하고 싶을 때",
    englishDescription: "High fluttery energy requiring soft focus",
  },
];

export const DURATION_OPTIONS = [
  { value: 1, label: "1분 (빠른 테스트)" },
  { value: 5, label: "5분" },
  { value: 10, label: "10분" },
  { value: 20, label: "20분" },
  { value: 30, label: "30분" },
];
