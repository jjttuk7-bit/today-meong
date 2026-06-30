import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Globe, X, HeartHandshake, Compass, Layers, Headset, Volume2 } from "lucide-react";
import { ThemeId, MoodQuickId, AIParams } from "./types";
import { ThemeSelector } from "./components/ThemeSelector";
import { MoodInput } from "./components/MoodInput";
import { DurationSelector } from "./components/DurationSelector";
import { MeditationPlayback } from "./components/MeditationPlayback";

type Stage = "theme" | "mood" | "duration" | "loading" | "meditation";

export default function App() {
  const [stage, setStage] = useState<Stage>("theme");
  const [selectedTheme, setSelectedTheme] = useState<ThemeId | null>(null);
  const [moodText, setMoodText] = useState("");
  const [selectedMood, setSelectedMood] = useState<MoodQuickId>("calm");
  const [duration, setDuration] = useState(5); // default 5 minutes
  const [aiParams, setAiParams] = useState<AIParams | null>(null);
  const [lang, setLang] = useState<"ko" | "en">("ko");
  const [showGlobalModal, setShowGlobalModal] = useState(false);

  const isEn = lang === "en";

  // Trigger OpenAI API call to analyze mood and generate parameters
  const handleStartAnalysis = async () => {
    if (!selectedTheme) return;
    setStage("loading");

    try {
      const response = await fetch("/api/analyze-mood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          moodText,
          moodQuick: selectedMood,
          lang,
        }),
      });

      if (!response.ok) {
        throw new Error("Mood analysis network request failed");
      }

      const params: AIParams = await response.json();
      setAiParams(params);
      
      // Delay slightly for visual pacing and immersion
      setTimeout(() => {
        setStage("meditation");
      }, 2500);
    } catch (error) {
      console.error("Failed to connect to AI analyzer:", error);
      // Hard fallback parameters inside client in case of unexpected errors
      const fallbackParams: AIParams = {
        colors: ["#fc4a1a", "#f7b733", "#120201"],
        speedMultiplier: 0.8,
        density: 0.9,
        glow: 0.8,
        pitch: 110,
        soundSpeed: 0.8,
        greeting: isEn 
          ? "Welcome to this quiet space of rest. Draw your breath in and out slowly."
          : "고요한 쉼의 공간에 들어오신 것을 환영합니다. 천천히 숨을 들이쉬고 내쉬어 보세요.",
        affirmation: isEn
          ? "May today's short breaths deliver peaceful warmth and energy into your routine."
          : "오늘의 짧은 호흡이 일상에 평온한 에너지를 전해 주기를 바랍니다.",
        ambientNoiseLevel: 0.4,
      };
      setAiParams(fallbackParams);
      setTimeout(() => {
        setStage("meditation");
      }, 2000);
    }
  };

  const handleResetSession = () => {
    setStage("theme");
    setSelectedTheme(null);
    setMoodText("");
    setSelectedMood("calm");
    setDuration(5);
    setAiParams(null);
  };

  return (
    <div id="app-container" className="min-h-screen bg-[#050505] text-slate-300 flex flex-col justify-between selection:bg-orange-500/30 overflow-x-hidden font-sans relative">
      {/* Subtle top/bottom cosmic grid gradients */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-orange-950/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t from-black to-transparent pointer-events-none z-0" />

      {/* Primary Header - Clean Minimalism Atmosphere */}
      {stage !== "meditation" && stage !== "loading" && (
        <header className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 flex justify-between items-end border-b border-white/5">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-light tracking-tighter text-white">
              {isEn ? "Today's " : "오늘의 "}<span className="text-orange-500 font-normal">{isEn ? "Meong" : "멍"}</span>
            </h1>
            <p className="text-[10px] opacity-40 font-light tracking-[0.2em] uppercase">AI Healing Atmosphere</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Lang switcher toggle button */}
            <div className="flex bg-white/[0.03] border border-white/10 rounded-full p-0.5 relative z-20">
              <button
                id="lang-ko-btn"
                onClick={() => setLang("ko")}
                className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded-full transition-all cursor-pointer ${
                  lang === "ko" ? "bg-orange-500 text-white font-medium" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                KO
              </button>
              <button
                id="lang-en-btn"
                onClick={() => setLang("en")}
                className={`px-3 py-1 text-[10px] font-mono tracking-wider rounded-full transition-all cursor-pointer ${
                  lang === "en" ? "bg-orange-500 text-white font-medium" : "text-slate-500 hover:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>

            {/* Active step marker */}
            <div className="hidden md:flex flex-col items-end gap-1 font-mono text-[10px] uppercase tracking-[0.15em]">
              <span className="block text-[9px] uppercase tracking-[0.3em] opacity-30">Step Indicator</span>
              <div className="flex items-center gap-2 text-stone-500">
                <span className={stage === "theme" ? "text-orange-500 font-medium" : "opacity-50"}>
                  {isEn ? "01 Atmosphere" : "01 테마"}
                </span>
                <span>•</span>
                <span className={stage === "mood" ? "text-orange-500 font-medium" : "opacity-50"}>
                  {isEn ? "02 Intent" : "02 기분"}
                </span>
                <span>•</span>
                <span className={stage === "duration" ? "text-orange-500 font-medium" : "opacity-50"}>
                  {isEn ? "03 Duration" : "03 시간"}
                </span>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main setup wizard stages */}
      <main className="relative z-10 flex-grow flex items-center justify-center py-10">
        <AnimatePresence mode="wait">
          {stage === "theme" && (
            <motion.div
              key="theme-stage"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5 }}
              className="w-full"
            >
              <ThemeSelector
                selectedTheme={selectedTheme}
                onSelectTheme={(id) => {
                  setSelectedTheme(id);
                  setStage("mood");
                }}
                lang={lang}
              />
            </motion.div>
          )}

          {stage === "mood" && (
            <motion.div
              key="mood-stage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <MoodInput
                moodText={moodText}
                setMoodText={setMoodText}
                selectedMood={selectedMood}
                setSelectedMood={setSelectedMood}
                onNext={() => setStage("duration")}
                onBack={() => setStage("theme")}
                lang={lang}
              />
            </motion.div>
          )}

          {stage === "duration" && (
            <motion.div
              key="duration-stage"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full"
            >
              <DurationSelector
                duration={duration}
                setDuration={setDuration}
                onBack={() => setStage("mood")}
                onStart={handleStartAnalysis}
                lang={lang}
              />
            </motion.div>
          )}

          {stage === "loading" && (
            <motion.div
              key="loading-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-sm px-6 text-center"
            >
              {/* Starry spinning loader */}
              <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-orange-500/20 border-t-orange-500"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute w-14 h-14 rounded-full border border-purple-500/20 border-b-purple-500"
                />
                <Sparkles className="w-6 h-6 text-orange-400 animate-pulse" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {isEn ? "Creating AI Ambient Space" : "AI 맞춤 공간 생성 중"}
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed animate-pulse">
                {isEn 
                  ? "Analyzing your current mood to synthesize fine visual particles and therapeutic sound frequencies..."
                  : "당신의 오늘 기분을 분석하여 잔잔한 비주얼과 치유 소리 주파수를 조율하고 있습니다..."}
              </p>
            </motion.div>
          )}

          {stage === "meditation" && aiParams && selectedTheme && (
            <motion.div
              key="meditation-stage"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 w-full h-full z-50"
            >
              <MeditationPlayback
                theme={selectedTheme}
                params={aiParams}
                duration={duration}
                onExit={handleResetSession}
                lang={lang}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer - Minimal brand message & Global Expansion triggers */}
      {stage !== "meditation" && stage !== "loading" && (
        <footer className="relative z-10 w-full max-w-4xl mx-auto px-6 py-8 mt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
          <div className="flex gap-6">
            <button
              id="global-plan-btn"
              onClick={() => setShowGlobalModal(true)}
              className="flex items-center gap-1.5 text-orange-500/80 hover:text-orange-400 transition-colors cursor-pointer bg-orange-500/5 px-2.5 py-1 rounded-full border border-orange-500/10"
            >
              <Globe className="w-3 h-3" />
              <span>{isEn ? "Global Horizons Strategy" : "글로벌 확장 비전 기획"}</span>
            </button>
            <span className="opacity-60 hidden md:inline">Noise Engine: Ambient Synth</span>
            <span className="opacity-60 hidden md:inline">Visual: Fluid Generative 3.5</span>
          </div>
          <span className="opacity-60">2026 &copy; TODAY'S MEONG</span>
        </footer>
      )}

      {/* IMMERSIVE GLOBAL HORIZON PLAN BENTO MODAL */}
      <AnimatePresence>
        {showGlobalModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-3xl bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 w-full" />
              
              <button
                id="close-global-modal"
                onClick={() => setShowGlobalModal(false)}
                className="absolute top-5 right-5 text-slate-500 hover:text-white transition-colors cursor-pointer p-1 rounded-full hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-light text-white tracking-tight">
                      {isEn ? "Global Expansion Horizons" : "글로벌 사용자 확장 비전 및 테라피 기획"}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {isEn ? "ARCHITECTING SCALE FROM 5 BASIC CORE ATMOSPHERES" : "5가지 기본 '멍' 테마에서 전세계를 위한 무한 치유 플랫폼으로"}
                    </p>
                  </div>
                </div>

                {/* Bento Grid Concept Presentation */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {/* Card 1: 5 Archetypes Multi-Cultural Localization */}
                  <div className="md:col-span-1 p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div>
                      <Compass className="w-5 h-5 text-amber-500 mb-3" />
                      <h3 className="text-sm font-medium text-white tracking-tight mb-2">
                        {isEn ? "1. Localization Framework" : "1. 문화별 테마 현지화"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {isEn
                          ? "Customizing the 5 foundational atmospheres (Fire, Water, Wave, Cloud, Rain) matching regional healing culture and ambient noise tones."
                          : "불멍, 물멍 등 5가지 핵심 테마를 세계 각지의 힐링 정서와 기후 백색소음으로 매핑하여 맞춤형 현지화(예: 유럽식 모닥불, 동남아 열대우림 빗소리)."}
                      </p>
                    </div>
                  </div>

                  {/* Card 2: AI Generative Ambient Crowdsourcing */}
                  <div className="md:col-span-1 p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div>
                      <Layers className="w-5 h-5 text-orange-500 mb-3" />
                      <h3 className="text-sm font-medium text-white tracking-tight mb-2">
                        {isEn ? "2. AI Soundscape Crowdsourcing" : "2. AI 공간 크라우드소싱"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {isEn
                          ? "Allowing global users to upload local atmospheric sounds (e.g., Paris cafe, Kyoto rain) which our AI transforms into custom modular synth frequencies."
                          : "글로벌 사용자가 업로드한 자신만의 '멍' 소리(도쿄 지하철, 교토의 처마 밑 빗소리 등)를 분석하여 AI 합성 사운드스케이프로 자동 결합 및 공유하는 시스템."}
                      </p>
                    </div>
                  </div>

                  {/* Card 3: Multi-lingual Voice Therapy */}
                  <div className="md:col-span-1 p-5 rounded-xl border border-white/5 bg-white/[0.02] flex flex-col justify-between hover:border-white/10 transition-colors">
                    <div>
                      <Headset className="w-5 h-5 text-purple-500 mb-3" />
                      <h3 className="text-sm font-medium text-white tracking-tight mb-2">
                        {isEn ? "3. Cross-Border TTS Therapy" : "3. 글로벌 보이스 치료"}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed font-light">
                        {isEn
                          ? "Dynamic TTS text therapy engine translating Zen opening greetings and breathing cadences across all popular international languages on-the-fly."
                          : "실시간 번역 및 자연스러운 현지 억양의 다국어 음성 안내 가이드(TTS)를 통해, 인종과 국경을 넘어 모든 언어권에서 매끄러운 수면 유도 및 명상 선사."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Status Indicator & Summary Quote */}
                <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-4 h-4 text-orange-400 animate-pulse" />
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
                      {isEn ? "Active Localizer Integrated" : "현재 한국어 및 영어 완벽 번역 엔진 탑재 완료"}
                    </span>
                  </div>
                  <button
                    id="try-global-modal"
                    onClick={() => setShowGlobalModal(false)}
                    className="px-4 py-1.5 rounded-full bg-white text-black text-[10px] font-mono uppercase tracking-wider font-medium hover:bg-orange-50 transition-colors cursor-pointer"
                  >
                    {isEn ? "Try Now" : "지금 체험해보기"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
