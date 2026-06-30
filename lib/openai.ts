import OpenAI from "openai";

// Shared OpenAI logic used by both the local Express dev server (server.ts)
// and the Vercel serverless functions under /api.

export interface MoodAnalysisInput {
  theme: string;
  moodText?: string;
  moodQuick?: string;
  lang?: string;
}

// Fallback logic for when the OpenAI API is unavailable or throws an error
export function getFallbackParams(theme: string, moodQuick: string, moodText: string, lang: string = "ko") {
  let colors: string[] = ["#000000", "#000000"];
  let speedMultiplier = 1.0;
  let density = 1.0;
  let glow = 0.8;
  let pitch = 100;
  let soundSpeed = 1.0;
  let greeting = "";
  let affirmation = "";
  let ambientNoiseLevel = 0.4;

  const isEn = lang === "en";

  const moodName = isEn
    ? { stress: "Stress", calm: "Calm", anxiety: "Anxiety", lethargy: "Lethargy", excitement: "Excitement" }[moodQuick] || "Rest"
    : { stress: "스트레스", calm: "평온", anxiety: "불안", lethargy: "무기력", excitement: "설렘" }[moodQuick] || "휴식";

  switch (theme) {
    case "fire":
      colors = ["#ff4500", "#ff8c00", "#1a0805"];
      pitch = 85;
      soundSpeed = 0.8;
      if (moodQuick === "stress") {
        colors = ["#ff3333", "#ffaa33", "#2a0404"];
        speedMultiplier = 1.4;
        density = 1.3;
        greeting = isEn
          ? "Throw your stress and heavy worries into the roaring fire."
          : "타오르는 불길 속에 당신의 스트레스와 무거운 고민들을 던져버리세요.";
        affirmation = isEn
          ? "Hope all your worries burned down into ashes. You did well today."
          : "불꽃 속으로 고민이 모두 타들어 갔기를 바랄게요. 수고 많으셨어요.";
      } else if (moodQuick === "lethargy") {
        colors = ["#ff7700", "#ffdd33", "#3a0c02"];
        speedMultiplier = 1.2;
        density = 1.2;
        greeting = isEn
          ? "The gently glowing warm fireplace will revitalize your tired soul."
          : "은은하게 타오르는 따뜻한 장작 불꽃이 당신 마음에 생기를 채워줄 거예요.";
        affirmation = isEn
          ? "Let the warm fire-glow spread over. Take your next step slowly."
          : "따뜻한 온기가 온몸에 퍼졌기를 바랍니다. 천천히 다시 나아가 봐요.";
      } else {
        colors = ["#fc4a1a", "#f7b733", "#1f0502"];
        speedMultiplier = 0.8;
        density = 0.9;
        greeting = isEn
          ? "Listen to the cozy, cracking wood fire and gently settle your mind."
          : "조용히 톡톡 튀는 모닥불 소리를 들으며 몸과 마음을 정돈해 보아요.";
        affirmation = isEn
          ? "May the calm and comfort of the fire hold you close tonight."
          : "불꽃이 준 차분함과 평온이 당신의 오늘 밤을 보듬어 주기를.";
      }
      break;

    case "water":
      colors = ["#0052d4", "#4364f7", "#050c1e"];
      pitch = 120;
      soundSpeed = 1.0;
      if (moodQuick === "anxiety") {
        colors = ["#00c6ff", "#0072ff", "#020b1a"];
        speedMultiplier = 0.5;
        density = 0.7;
        greeting = isEn
          ? "Like deep, silent water, let your chaotic thoughts sink down gently."
          : "깊고 잔잔한 물속처럼 어지러운 생각들이 부드럽게 가라앉기를 기다립니다.";
        affirmation = isEn
          ? "As the ripple settles, may the anxiety inside you calm down too."
          : "파동이 잠잠해지듯, 당신의 마음속 불안도 부드럽게 누그러졌기를.";
      } else if (moodQuick === "stress") {
        colors = ["#12c2e9", "#c471ed", "#080314"];
        speedMultiplier = 0.7;
        density = 0.8;
        greeting = isEn
          ? "Look at the cool, crystal water surface and dissolve your chest tightness."
          : "차가운 물방울과 맑은 수면을 보며 가슴속 답답함을 부드럽게 녹여내세요.";
        affirmation = isEn
          ? "Wash away your heavy memories in the running current of clarity."
          : "흐르는 물에 힘든 기억들을 맑게 씻어내어 가벼워졌기를 바랍니다.";
      } else {
        colors = ["#00c6ff", "#0072ff", "#020d1c"];
        speedMultiplier = 0.8;
        density = 1.0;
        greeting = isEn
          ? "Sink into the deep, soundless blue water and enjoy absolute peace."
          : "아무런 소음 없는 푸른 물속으로 조용히 침잠하며 편안함을 느껴보세요.";
        affirmation = isEn
          ? "May the serene clarity of water fulfill your tomorrow with calmness."
          : "맑은 물속 같은 고요함이 당신의 일상에 잔잔히 채워지길 바랍니다.";
      }
      break;

    case "wave":
      colors = ["#2b5876", "#4e4376", "#04050f"];
      pitch = 110;
      soundSpeed = 0.7;
      if (moodQuick === "stress") {
        colors = ["#4ca1af", "#c4e0e5", "#031215"];
        speedMultiplier = 1.3;
        density = 1.2;
        greeting = isEn
          ? "Let the ocean waves washing up the shore sweep your worries away."
          : "끝없이 다가와 모래사장에 부서지는 파도 소리에 걱정을 실어 보내세요.";
        affirmation = isEn
          ? "Like retreating sea foam, may your burdens fade out of sight."
          : "쓸려 내려가는 거품처럼 당신의 답답함도 밀려 나갔기를 바랍니다.";
      } else if (moodQuick === "anxiety") {
        colors = ["#00c6ff", "#0072ff", "#030a1c"];
        speedMultiplier = 0.6;
        density = 0.8;
        greeting = isEn
          ? "Sync your breath with the rhythmic, regular flow of the night sea."
          : "일정한 호흡으로 철썩이는 밤바다의 흐름에 당신의 마음에 숨을 맞춰보세요.";
        affirmation = isEn
          ? "Just like the ocean's steady pulse, you have found your inner pace."
          : "파도의 규칙적인 리듬처럼, 일정한 마음의 안정을 되찾았기를 바랍니다.";
      } else {
        colors = ["#141e30", "#243b55", "#02050c"];
        speedMultiplier = 0.9;
        density = 1.0;
        greeting = isEn
          ? "Gaze upon the incoming and outgoing waves, wandering your own time."
          : "밀려오고 밀려가는 파도를 그저 바라보며 당신만의 시간 속을 걸어가 봐요.";
        affirmation = isEn
          ? "Like tides that always return, hope you greet tomorrow beautifully."
          : "밀물과 썰물처럼 늘 찾아오는 내일도 아름답게 맞이할 수 있기를.";
      }
      break;

    case "cloud":
      colors = ["#020024", "#090979", "#00d4ff"];
      pitch = 160;
      soundSpeed = 0.6;
      if (moodQuick === "lethargy") {
        colors = ["#ff007f", "#7f00ff", "#130222"];
        speedMultiplier = 1.1;
        density = 1.1;
        greeting = isEn
          ? "As sunset clouds color the sky, let us recharge your energy slowly."
          : "노을빛 구름이 하늘을 서서히 물들여 가듯, 다시 천천히 에너지를 채워봐요.";
        affirmation = isEn
          ? "Like clouds floating high, your heart is now light and free."
          : "하늘 높이 흘러간 구름처럼 당신의 마음도 평온하게 날아올랐기를.";
      } else if (moodQuick === "anxiety") {
        colors = ["#4a00e0", "#8e2de2", "#0b011d"];
        speedMultiplier = 0.4;
        density = 0.7;
        greeting = isEn
          ? "Watch the slow-moving clouds and scatter all heavy thoughts away."
          : "아주 느리게 흘러가는 구름을 바라보며 나를 억누르는 생각들을 허공에 흩뿌려요.";
        affirmation = isEn
          ? "As the wind clears the fog, your mental clouds have cleared up too."
          : "바람에 안개가 흩어지듯, 마음의 그늘도 환하게 개었기를 바랄게요.";
      } else {
        colors = ["#312e81", "#1e1b4b", "#030712"];
        speedMultiplier = 0.6;
        density = 0.9;
        greeting = isEn
          ? "Focus on the infinite cosmos and cloud travel. Gift yourself absolute rest."
          : "무한한 우주와 구름의 여정에 시선을 두고, 당신의 마음에 완전한 휴식을 선사하세요.";
        affirmation = isEn
          ? "Wishing you close today with a light, cloud-like peaceful heart."
          : "구름을 닮은 가벼운 마음으로 오늘 하루 편안히 매듭지으시기를.";
      }
      break;

    case "rain":
      colors = ["#141e30", "#243b55", "#070c14"];
      pitch = 140;
      soundSpeed = 1.2;
      if (moodQuick === "stress") {
        colors = ["#2c3e50", "#3498db", "#080e14"];
        speedMultiplier = 1.4;
        density = 1.4;
        greeting = isEn
          ? "Listen to the heavy rain washing away all of today's stress."
          : "세차게 내리는 빗소리가 가슴속의 복잡한 생각과 스트레스를 세차게 씻어냅니다.";
        affirmation = isEn
          ? "Just as the sky clears after a storm, your night will be clear and calm."
          : "비 그친 뒤 하늘이 맑아지듯, 당신의 오늘 밤도 무척 맑을 거예요.";
      } else if (moodQuick === "calm") {
        colors = ["#3a7bd5", "#3a6073", "#08101a"];
        speedMultiplier = 0.8;
        density = 0.9;
        greeting = isEn
          ? "Accompany the pattering transparent rain outside and ponder silently."
          : "창가에 토닥토닥 내리는 투명한 빗소리와 차분히 동행하며 사색에 잠겨보세요.";
        affirmation = isEn
          ? "The gentle raindrops have touched and embraced your warm heart."
          : "토닥이던 빗방울이 가슴을 촉촉하고 따스하게 안아주었기를 바랄게요.";
      } else {
        colors = ["#3a6073", "#141e30", "#050c12"];
        speedMultiplier = 1.0;
        density = 1.1;
        greeting = isEn
          ? "Find deep serenity in the endless falling harmony of raindrops."
          : "끝없이 낙하하는 빗방울들의 일정한 하모니 속에 마음의 평화를 찾아보세요.";
        affirmation = isEn
          ? "Sleep tightly in the tranquil darkness left behind by the rain."
          : "빗소리가 남긴 정취 가득한 고요 속에 편안하게 단잠을 청해보세요.";
      }
      break;
  }

  return {
    colors,
    speedMultiplier,
    density,
    glow,
    pitch,
    soundSpeed,
    greeting: greeting || (isEn ? `A healing space curated for your ${moodName} mood.` : `${moodName}의 기분을 다독여 줄 오늘의 힐링 공간입니다.`),
    affirmation: affirmation || (isEn ? "Completed your deep staring session. May your mind remain calm." : "오늘의 온전한 멍때리기를 마쳤습니다. 마음이 차분해졌기를 바라요."),
    ambientNoiseLevel,
  };
}

function hasApiKey(): boolean {
  const apiKey = process.env.OPENAI_API_KEY;
  return !!apiKey && apiKey !== "MY_OPENAI_API_KEY" && apiKey !== "";
}

// Analyze mood with OpenAI; gracefully falls back to deterministic params.
export async function analyzeMood({ theme, moodText, moodQuick, lang = "ko" }: MoodAnalysisInput) {
  const isEn = lang === "en";

  if (!hasApiKey()) {
    return getFallbackParams(theme, moodQuick || "calm", moodText || "", lang);
  }

  try {
    const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const userPrompt = `
      Theme: ${theme}
      User Raw Mood Text: "${moodText || (isEn ? "I want to rest" : "쉬고 싶어요")}"
      Selected Mood Category: ${moodQuick || "calm"}
      Target Language: ${isEn ? "ENGLISH" : "KOREAN"}
    `;

    const systemInstruction = `
      You are a Zen master and beautiful digital artist for a meditation web app called "오늘의 멍" (Today's Meong / Staring Out).
      Analyze the user's emotional state, theme, and text to generate custom visual/synthesizer variables and healing comfort quotes.

      IMPORTANT: You must return a valid JSON object matching the following structure strictly. Do not include markdown wraps (like \`\`\`json) or any extra characters. Just the JSON text itself.

      {
        "colors": [string, string, string], // 3 dark/ambient hex color codes representing the healing space. Eye-friendly dark palette (e.g. #030712, #111827).
        "speedMultiplier": number, // Motion speed between 0.3 (extremely slow/peaceful) and 1.8 (dynamic/expressive).
        "density": number, // Element count/density between 0.4 (minimalist) and 1.4 (immersive).
        "glow": number, // Visual blur/glow opacity between 0.3 and 1.0.
        "pitch": number, // Base synthesizer drone frequency parameter between 60 and 260.
        "soundSpeed": number, // Synthesizer speed/modulation between 0.5 and 1.8.
        "greeting": string, // Under 50 characters. Beautiful opening comfort quote addressing their state and theme. MUST BE written in ${isEn ? "ENGLISH" : "KOREAN"}. (e.g. ${isEn ? '"Let go of your busy day and melt your mind into this quiet water."' : '"불안했던 오늘의 하루, 잔잔한 수면에 모두 흘려보내 보아요."'})
        "affirmation": string, // Under 50 characters. Peaceful closing message. MUST BE written in ${isEn ? "ENGLISH" : "KOREAN"}. (e.g. ${isEn ? '"May your long night be a little more gentle and peaceful."' : '"당신의 긴 밤이 조금 더 부드럽고 온화하기를 바랍니다."'})
        "ambientNoiseLevel": number // Volume multiplier between 0.2 and 0.7.
      }
    `;

    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    const parsed = JSON.parse(text);

    if (
      Array.isArray(parsed.colors) &&
      typeof parsed.speedMultiplier === "number" &&
      typeof parsed.density === "number" &&
      typeof parsed.greeting === "string" &&
      typeof parsed.affirmation === "string"
    ) {
      return parsed;
    }
    throw new Error("Invalid response format from OpenAI");
  } catch (error) {
    console.error("OpenAI mood analysis error:", error);
    return getFallbackParams(theme, moodQuick || "calm", moodText || "", lang);
  }
}

// Curated OpenAI TTS voices well-suited to a calm meditation guide.
export const TTS_VOICES = ["shimmer", "coral", "nova", "sage", "alloy", "fable"] as const;
export type TtsVoice = (typeof TTS_VOICES)[number];

export interface SpeechInput {
  text: string;
  voice?: string;
  instructions?: string;
}

// Synthesize narration speech with OpenAI. Throws when no API key is set so the
// client can gracefully fall back to the browser's speechSynthesis.
export async function synthesizeSpeech({ text, voice = "shimmer", instructions }: SpeechInput) {
  if (!hasApiKey()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const safeVoice = (TTS_VOICES as readonly string[]).includes(voice) ? voice : "shimmer";

  const response = await ai.audio.speech.create({
    model: "gpt-4o-mini-tts",
    voice: safeVoice as TtsVoice,
    input: text,
    instructions:
      instructions ||
      [
        "Identity: A professional meditation and yoga instructor guiding a late-night relaxation session.",
        "Voice affect: Soft, warm, feminine, deeply soothing and intimate.",
        "Tone: Serene, nurturing, tranquil — never bright, energetic, or announcer-like.",
        "Delivery: Breathy, hushed, relaxed, with soft falling intonation and slightly lowered pitch.",
        "Pacing: Extremely slow and spacious, leaving long, calm silences between sentences.",
        "Pronunciation: Smooth and softened, gently trailing — never clipped or robotic.",
      ].join("\n"),
    response_format: "mp3",
  });

  const arrayBuffer = await response.arrayBuffer();
  return { audio: Buffer.from(arrayBuffer), contentType: "audio/mpeg" };
}

// --- AI background image generation (gpt-image-1) ---

const THEME_SCENE: Record<string, string> = {
  fire: "an intimate close-up of glowing embers and a softly burning bonfire at night, deep amber and orange light, drifting sparks and gentle smoke",
  water: "a dreamy underwater scene of deep tranquil blue water with soft light rays and rising bubbles, serene and weightless",
  wave: "a calm dark ocean at night under faint moonlight, gentle rolling waves meeting a quiet shore, deep teal and indigo",
  cloud: "slow drifting clouds across a vast deep twilight sky with faint distant stars, dreamy purple and indigo nebula tones",
  rain: "soft rain falling against a window at night with blurred bokeh city lights, moody blue and slate tones, cozy and quiet",
};

const MOOD_FEELING: Record<string, string> = {
  stress: "calming and releasing tension",
  calm: "peaceful and deeply restful",
  anxiety: "safe, grounding and reassuring",
  lethargy: "gently warm and softly uplifting",
  excitement: "soothing and quietly settling",
};

export interface BackgroundInput {
  theme: string;
  moodQuick?: string;
  size?: "1024x1024" | "1536x1024" | "1024x1536";
}

// Generate an ambient meditation background image. Throws when no API key is set
// so the client can gracefully keep the pure generative-canvas look.
export async function generateBackground({ theme, moodQuick, size = "1536x1024" }: BackgroundInput) {
  if (!hasApiKey()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const ai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const scene = THEME_SCENE[theme] || THEME_SCENE.cloud;
  const feeling = MOOD_FEELING[moodQuick || "calm"] || MOOD_FEELING.calm;

  const prompt = `A serene, cinematic meditation background: ${scene}. Atmosphere ${feeling}. Dark, eye-friendly, low-key ambient tones suitable for staring at for a long time. Soft focus, dreamy bokeh, abstract and minimal, no people, no text, no logos, no harsh bright highlights.`;

  const response = await ai.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
    quality: "medium",
  });

  const b64 = response.data?.[0]?.b64_json;
  if (!b64) {
    throw new Error("Image generation returned no data");
  }

  return { dataUrl: `data:image/png;base64,${b64}` };
}
