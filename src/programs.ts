import { Program } from "./types";

// Multi-day guided journeys — the "come back tomorrow" content layer.
export const PROGRAMS: Program[] = [
  {
    id: "sleep-7",
    name: "7일 숙면 여정",
    englishName: "7 Days to Deep Sleep",
    description: "잠들기 전 매일 밤, 몸과 마음을 천천히 재워주는 7일 루틴",
    englishDescription: "A 7-night routine that gently winds your body and mind down before sleep",
    gradient: "from-indigo-600 via-purple-500 to-slate-950",
    days: [
      { day: 1, title: "하루를 내려놓기", englishTitle: "Let the Day Go", theme: "rain", mood: "stress", durationMin: 5 },
      { day: 2, title: "빗소리에 잠기기", englishTitle: "Sink into the Rain", theme: "rain", mood: "calm", durationMin: 5 },
      { day: 3, title: "잔잔한 물의 호흡", englishTitle: "Breath of Still Water", theme: "water", mood: "anxiety", durationMin: 10 },
      { day: 4, title: "밤바다의 리듬", englishTitle: "Rhythm of the Night Sea", theme: "wave", mood: "anxiety", durationMin: 10 },
      { day: 5, title: "구름 위의 고요", englishTitle: "Stillness Above the Clouds", theme: "cloud", mood: "calm", durationMin: 10 },
      { day: 6, title: "생각 흘려보내기", englishTitle: "Let Thoughts Drift", theme: "cloud", mood: "anxiety", durationMin: 15 },
      { day: 7, title: "깊은 잠으로", englishTitle: "Into Deep Sleep", theme: "rain", mood: "calm", durationMin: 20 },
    ],
  },
  {
    id: "anxiety-7",
    name: "7일 불안 완화",
    englishName: "7 Days to Calm",
    description: "요동치는 마음을 매일 조금씩 가라앉히는 7일 안정 루틴",
    englishDescription: "A 7-day routine that settles a restless mind, a little more each day",
    gradient: "from-teal-600 via-cyan-500 to-indigo-950",
    days: [
      { day: 1, title: "지금 여기에 머물기", englishTitle: "Arrive in the Now", theme: "water", mood: "anxiety", durationMin: 5 },
      { day: 2, title: "불꽃 앞에서 진정하기", englishTitle: "Settle by the Fire", theme: "fire", mood: "stress", durationMin: 5 },
      { day: 3, title: "파도에 걱정 실어보내기", englishTitle: "Send Worries to the Waves", theme: "wave", mood: "stress", durationMin: 10 },
      { day: 4, title: "느린 물의 안정", englishTitle: "Slow Water, Steady Heart", theme: "water", mood: "calm", durationMin: 10 },
      { day: 5, title: "빗소리로 씻어내기", englishTitle: "Rinse it in the Rain", theme: "rain", mood: "stress", durationMin: 10 },
      { day: 6, title: "구름처럼 가볍게", englishTitle: "Light as a Cloud", theme: "cloud", mood: "anxiety", durationMin: 15 },
      { day: 7, title: "고요를 내 것으로", englishTitle: "Make Calm Your Own", theme: "water", mood: "calm", durationMin: 15 },
    ],
  },
];

export const getProgram = (id: string) => PROGRAMS.find((p) => p.id === id);
