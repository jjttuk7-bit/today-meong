import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Pause, X, Volume2, VolumeX, Sparkles, RefreshCw, Mic, MicOff, Settings, Heart } from "lucide-react";
import { ThemeId, AIParams, BreathingId, MusicId, ColorId } from "../types";
import { Visualizer } from "./Visualizer";
import { useSound } from "../hooks/useSound";

interface MeditationPlaybackProps {
  theme: ThemeId;
  params: AIParams;
  duration: number; // in minutes
  onExit: () => void;
  lang: "ko" | "en";
}

export function MeditationPlayback({
  theme,
  params,
  duration,
  onExit,
  lang,
}: MeditationPlaybackProps) {
  const { initSynth, fadeOutAndStop, setVolume } = useSound();
  
  const [isEntering, setIsEntering] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration * 60); // converted to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(params.ambientNoiseLevel || 0.4);
  const [showBreathGuide, setShowBreathGuide] = useState(true);
  const [breathePhase, setBreathePhase] = useState<"inhale" | "hold" | "exhale" | "hold_empty">("inhale");
  const [selectedBreathingId, setSelectedBreathingId] = useState<BreathingId>("coherent");
  const [selectedMusicId, setSelectedMusicId] = useState<MusicId>("off");
  const [selectedColorId, setSelectedColorId] = useState<ColorId>("off");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");
  const [voiceRate, setVoiceRate] = useState<number>(0.68); // ultra calm meditation pace
  const [showVoicePanel, setShowVoicePanel] = useState<boolean>(false);
  const [showTherapyPanel, setShowTherapyPanel] = useState<boolean>(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isEn = lang === "en";

  // Load and subscribe to speechSynthesis voices
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const koVoices = allVoices.filter(v => v.lang.startsWith("ko"));
      setVoices(koVoices);

      // Select highest quality default voice
      if (koVoices.length > 0) {
        const premiumVoice = koVoices.find(v => 
          v.name.includes("Female") || 
          v.name.includes("Google") || 
          v.name.includes("Yuna") || 
          v.name.includes("Kyuri") || 
          v.name.includes("Premium") || 
          v.name.includes("natural") || 
          v.name.includes("Siri") || 
          v.name.includes("Microsoft") ||
          v.name.toLowerCase().includes("woman")
        );
        setSelectedVoiceName(prev => prev || (premiumVoice ? premiumVoice.name : koVoices[0].name));
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Initialize synthesis when component mounts or Solfeggio frequency changes
  useEffect(() => {
    // Start procedural synthesizer
    initSynth(theme, params, selectedMusicId);

    // Initial 6-second entering welcome text sequence
    const welcomeTimer = setTimeout(() => {
      setIsEntering(false);
      // Trigger a brief controls notification so user knows they can click to toggle
      showControlsTemporarily();
    }, 6000);

    return () => {
      clearTimeout(welcomeTimer);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [theme, params, selectedMusicId]);

  // Handle active session timer countdown
  useEffect(() => {
    if (isEntering || isPaused || isFinished) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
          clearInterval(timerIntervalRef.current!);
          timerIntervalRef.current = null;
          handleSessionCompletion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isEntering, isPaused, isFinished]);

  // High-Fidelity Yoga Pranayama scheduler
  useEffect(() => {
    if (isEntering || isPaused || isFinished) return;

    let timeoutId: NodeJS.Timeout;
    
    const runNext = () => {
      let nextPhase: typeof breathePhase = "inhale";
      let delay = 4000;

      if (selectedBreathingId === "coherent") {
        if (breathePhase === "inhale" || breathePhase === "hold" || breathePhase === "hold_empty") {
          nextPhase = "exhale";
          delay = 4000; // 4s inhale duration
        } else {
          nextPhase = "inhale";
          delay = 4000; // 4s exhale duration
        }
      } else if (selectedBreathingId === "sleep") {
        if (breathePhase === "inhale" || breathePhase === "hold_empty") {
          nextPhase = "hold";
          delay = 4000; // 4s inhale duration
        } else if (breathePhase === "hold") {
          nextPhase = "exhale";
          delay = 7000; // 7s hold duration
        } else {
          nextPhase = "inhale";
          delay = 8000; // 8s exhale duration
        }
      } else if (selectedBreathingId === "box") {
        if (breathePhase === "inhale") {
          nextPhase = "hold";
          delay = 4000; // 4s inhale duration
        } else if (breathePhase === "hold") {
          nextPhase = "exhale";
          delay = 4000; // 4s hold duration
        } else if (breathePhase === "exhale") {
          nextPhase = "hold_empty";
          delay = 4000; // 4s exhale duration
        } else {
          nextPhase = "inhale";
          delay = 4000; // 4s empty hold duration
        }
      }

      timeoutId = setTimeout(() => {
        setBreathePhase(nextPhase);
      }, delay);
    };

    runNext();

    return () => clearTimeout(timeoutId);
  }, [isEntering, isPaused, isFinished, selectedBreathingId, breathePhase]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Premium Voice Guidance & Subtitles Effect
  useEffect(() => {
    if (isEntering || isPaused || isFinished || !isVoiceEnabled) {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (isEntering || isPaused || isFinished) {
        setCurrentSubtitle(null);
      }
      return;
    }

    const elapsed = duration * 60 - timeLeft;

    // Rhythmic, highly professional, slow pacing meditation voice narration scripts
    const narrationScript = isEn ? [
      { second: 1, text: "Gently sink into deep silence. Breathe comfortably." },
      { second: 10, text: "Slowly draw a breath in, then exhale peacefully." },
      { second: 20, text: "Now let go of all busy thoughts, and embrace this quiet stillness." }
    ] : [
      { second: 1, text: "깊은 멍의 침묵 속으로 들어가 봅니다. 편안하게 호흡을 시작하세요." },
      { second: 10, text: "천천히 숨을 들이마시고 편안하게 내쉽니다." },
      { second: 20, text: "이제 모든 생각을 내려놓고, 고요하고 아늑한 침묵을 즐겨보세요." }
    ];

    const currentLine = narrationScript.find(item => item.second === elapsed);
    if (currentLine) {
      setCurrentSubtitle(currentLine.text);

      const speakBreathGuide = (text: string) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = isEn ? "en-US" : "ko-KR";

        const allVoices = window.speechSynthesis.getVoices();
        const matchedVoice = allVoices.find(v => v.name === selectedVoiceName);

        if (matchedVoice) {
          utterance.voice = matchedVoice;
        } else {
          // Locate premium natural female voices in English or Korean
          const matchedLangVoice = allVoices.find(v => 
            v.lang.toLowerCase().includes(isEn ? "en" : "ko") && 
            (
              v.name.includes("Female") || 
              v.name.includes("Google") || 
              v.name.includes("Samantha") || 
              v.name.includes("Hazel") || 
              v.name.includes("Premium") || 
              v.name.includes("natural") || 
              v.name.includes("Siri") || 
              v.name.includes("Microsoft") ||
              v.name.toLowerCase().includes("woman")
            )
          );
          if (matchedLangVoice) utterance.voice = matchedLangVoice;
        }

        utterance.pitch = 0.88; // Calm, warm, deep female tone
        utterance.rate = voiceRate;  // Beautiful slow meditation therapeutic cadence
        utterance.volume = 0.85; // Blended volume

        window.speechSynthesis.speak(utterance);
      };

      speakBreathGuide(currentLine.text);

      // Automatically clear subtitles after 7.5 seconds
      const subtitleTimeout = setTimeout(() => {
        setCurrentSubtitle(null);
      }, 7500);

      return () => clearTimeout(subtitleTimeout);
    }
  }, [timeLeft, isEntering, isPaused, isFinished, isVoiceEnabled, duration, selectedVoiceName, voiceRate, isEn]);

  // Handle session completion transitions
  const handleSessionCompletion = () => {
    setIsFinished(true);
    // Smoothly fade-out sound over 2.5s
    fadeOutAndStop();
  };

  // Click handler to toggle controls display
  const handleScreenClick = (e: React.MouseEvent) => {
    // Prevent toggle if clicking on control elements directly
    const target = e.target as HTMLElement;
    if (target.closest(".interactive-control")) return;

    if (isFinished) return;

    showControlsTemporarily();
  };

  const showControlsTemporarily = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    
    controlsTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 4500); // hide control bars after 4.5s of inactivity
  };

  const togglePause = () => {
    if (isPaused) {
      setIsPaused(false);
      setVolume(isMuted ? 0 : volumeLevel);
    } else {
      setIsPaused(true);
      setVolume(0); // mute synthesis smoothly when paused without interrupting phase
    }
    showControlsTemporarily();
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(volumeLevel);
    } else {
      setIsMuted(true);
      setVolume(0);
    }
    showControlsTemporarily();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolumeLevel(newVol);
    setIsMuted(false);
    setVolume(newVol);
    showControlsTemporarily();
  };

  // Convert seconds to MM:SS format
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainingSecs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      id="meditation-playback-root"
      onClick={handleScreenClick}
      className="fixed inset-0 w-full h-full bg-black z-50 flex items-center justify-center overflow-hidden cursor-pointer select-none"
    >
      {/* 1. Generative Visual Canvas Backing */}
      {!isEntering && (
        <Visualizer 
          theme={theme} 
          params={params} 
          isPaused={isPaused || isFinished} 
          breathingId={selectedBreathingId}
          breathePhase={breathePhase}
          colorId={selectedColorId}
        />
      )}

      {/* 1.1 Sensory Coherence: Central Breathing Guide HUD */}
      {!isEntering && !isFinished && showBreathGuide && (() => {
        const getBreatheGuideStyle = () => {
          switch (breathePhase) {
            case "inhale":
              return {
                scale: 1.5,
                opacity: 0.45,
                borderColor: "rgba(249, 115, 22, 0.5)",
                bgColor: "rgba(249, 115, 22, 0.08)",
                label: isEn ? "Inhale" : "들이쉬기",
                sublabel: isEn ? "Breath In Gently" : "Inhale / 들숨",
                duration: 4.0
              };
            case "hold":
              return {
                scale: 1.5,
                opacity: 0.55,
                borderColor: "rgba(168, 85, 247, 0.6)",
                bgColor: "rgba(168, 85, 247, 0.12)",
                label: isEn ? "Hold" : "숨 참기",
                sublabel: isEn ? "Retain Full Breath" : "Hold / 가득 채움",
                duration: selectedBreathingId === "sleep" ? 7.0 : 4.0
              };
            case "exhale":
              return {
                scale: 1.0,
                opacity: 0.2,
                borderColor: "rgba(255, 255, 255, 0.25)",
                bgColor: "rgba(255, 255, 255, 0.01)",
                label: isEn ? "Exhale" : "내쉬기",
                sublabel: isEn ? "Release Slowly" : "Exhale / 날숨",
                duration: selectedBreathingId === "sleep" ? 8.0 : 4.0
              };
            case "hold_empty":
              return {
                scale: 1.0,
                opacity: 0.15,
                borderColor: "rgba(100, 116, 139, 0.35)",
                bgColor: "rgba(100, 116, 139, 0.05)",
                label: isEn ? "Hold Empty" : "숨 참기",
                sublabel: isEn ? "Stay Empty" : "Hold / 비워냄",
                duration: 4.0
              };
          }
        };

        const breatheStyle = getBreatheGuideStyle();

        return (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <motion.div
              animate={{
                scale: breatheStyle.scale,
                opacity: breatheStyle.opacity,
                borderColor: breatheStyle.borderColor
              }}
              transition={{
                duration: breatheStyle.duration,
                ease: "easeInOut"
              }}
              className="w-40 h-40 rounded-full border-2 flex items-center justify-center relative transition-all duration-1000"
            >
              {/* Inner ambient glowing core */}
              <motion.div 
                animate={{
                  scale: breatheStyle.scale * 0.8,
                  backgroundColor: breatheStyle.bgColor
                }}
                transition={{
                  duration: breatheStyle.duration,
                  ease: "easeInOut"
                }}
                className="absolute inset-2 rounded-full border border-white/5 blur-[2px]" 
              />
            </motion.div>
            
            <motion.div
              key={breathePhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.6, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.0, ease: "easeOut" }}
              className="text-center mt-8 flex flex-col items-center gap-1"
            >
              <span className="text-white text-sm tracking-[0.25em] font-light">
                {breatheStyle.label}
              </span>
              <span className="text-[9px] text-white/50 tracking-[0.2em] font-mono font-medium uppercase">
                {breatheStyle.sublabel}
              </span>
            </motion.div>
          </div>
        );
      })()}

      {/* 1.2 Elegant Subtitle Overlay */}
      <AnimatePresence>
        {!isEntering && !isFinished && currentSubtitle && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 1.0, ease: "easeOut" }}
            className="absolute bottom-28 left-4 right-4 text-center pointer-events-none z-20"
          >
            <div className="inline-block max-w-xl mx-auto px-6 py-3.5 bg-stone-950/70 backdrop-blur-md rounded-full border border-white/10 text-slate-200 text-xs sm:text-sm font-light leading-relaxed tracking-wide shadow-2xl">
              {currentSubtitle}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient shadow gradient overlays */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

      {/* 2. Welcome/Entering Welcome Greeting Screen Overlay */}
      <AnimatePresence>
        {isEntering && (
          <motion.div
            key="entering-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-40 cursor-default"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.2 }}
              className="mb-8 p-3 bg-white/5 border border-white/10 rounded-full w-fit"
            >
              <Sparkles className="w-6 h-6 text-orange-400 animate-spin-slow" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.5 }}
              className="text-white text-xl sm:text-2xl font-sans leading-relaxed max-w-xl px-4"
            >
              {params.greeting}
            </motion.p>
            
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 3.5, duration: 1.5 }}
              className="text-stone-400 text-xs mt-6 uppercase tracking-widest font-mono"
            >
              천천히 심호흡을 하며 눈을 감아도 좋습니다
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Session End / Finished Screen Overlay */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            key="finished-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.0 }}
            className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center p-6 text-center z-40 cursor-default"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1.0 }}
              className="mb-8"
            >
              <span className="text-sm text-orange-500 font-semibold uppercase tracking-widest block mb-2">오늘의 멍, 완료</span>
              <h2 className="text-4xl font-bold text-white tracking-tight">오늘의 멍이 끝났습니다.</h2>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 1.2 }}
              className="text-stone-300 text-base sm:text-lg max-w-lg mb-10 leading-relaxed font-sans"
            >
              {params.affirmation}
            </motion.p>

            <motion.button
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2, duration: 0.8 }}
              onClick={onExit}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 text-white text-sm font-semibold transition-all duration-300 shadow-lg shadow-orange-500/10 cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>처음으로 돌아가기</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Minimal Active Playback HUD (Always Visible, Non-Distracting) */}
      {!isEntering && !isFinished && (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
          {/* Top subtle theme label */}
          <div className="flex justify-between items-center w-full">
            <span className="text-white/30 text-xs font-medium tracking-widest uppercase">
              오늘의 멍 • {theme === "fire" ? "불멍" : theme === "water" ? "물멍" : theme === "wave" ? "파도멍" : theme === "cloud" ? "구름멍" : "비멍"}
            </span>
            {isPaused && (
              <span className="text-orange-500/70 text-xs font-mono animate-pulse uppercase tracking-wider">
                일시 정지됨
              </span>
            )}
          </div>

          {/* Bottom subtle countdown timer */}
          <div className="flex justify-center w-full pb-4">
            <span className="text-white/20 hover:text-white/40 transition-colors text-xs font-mono tracking-widest select-none">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>
      )}

      {/* 5. Click-to-Toggle Controller Overlay (Fades out automatically) */}
      <AnimatePresence>
        {controlsVisible && !isEntering && !isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-30 flex flex-col justify-between p-6 pointer-events-none"
          >
            {/* Top exit button bar */}
            <div className="flex justify-end w-full">
              <button
                id="playback-btn-exit"
                onClick={onExit}
                className="interactive-control pointer-events-auto p-3 bg-stone-900/80 backdrop-blur-md rounded-full border border-white/10 text-stone-300 hover:text-white transition-all duration-300 cursor-pointer active:scale-90"
                title="종료하기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Voice Settings Panel Overlay */}
            <AnimatePresence>
              {showVoicePanel && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="interactive-control absolute bottom-[130px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-5 bg-stone-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-white pointer-events-auto flex flex-col gap-4 z-40"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <span className="text-sm font-semibold tracking-wide text-orange-400 flex items-center gap-1.5">
                      <Mic className="w-4 h-4" />
                      전문가 목소리 가이드 설정
                    </span>
                    <button 
                      onClick={() => setShowVoicePanel(false)}
                      className="text-white/40 hover:text-white/80 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Voice Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                      보이스 선택 (내장 신경망 보이스 지원)
                    </label>
                    <select
                      id="voice-select-dropdown"
                      value={selectedVoiceName}
                      onChange={(e) => {
                        setSelectedVoiceName(e.target.value);
                        // Stop any ongoing guide speech immediately to avoid overlapping
                        if (window.speechSynthesis) window.speechSynthesis.cancel();
                      }}
                      className="w-full bg-stone-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500/50 cursor-pointer"
                    >
                      {voices.length === 0 ? (
                        <option value="">기본 한국어 보이스 (OS 내장)</option>
                      ) : (
                        voices.map((v) => {
                          let labelName = v.name;
                          // Clean up label names to look incredibly professional & natural
                          if (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Neural") || v.name.includes("Yuna") || v.name.includes("Kyuri") || v.name.includes("Siri")) {
                            labelName = `✨ ${v.name.replace(/Microsoft|Google|Apple/g, '').trim()} (추천: 내추럴 AI 보이스)`;
                          } else {
                            labelName = `${v.name.trim()} (기본)`;
                          }
                          return (
                            <option key={v.name} value={v.name}>
                              {labelName}
                            </option>
                          );
                        })
                      )}
                    </select>
                  </div>

                  {/* Speech Rate Control */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] uppercase tracking-wider text-white/50 font-medium">
                        말하기 템포 (호흡 유도 속도)
                      </label>
                      <span className="text-[10px] font-mono text-orange-400">
                        {voiceRate === 0.55 ? "매우 느리게" : voiceRate < 0.7 ? "느리게 (권장)" : voiceRate < 0.85 ? "차분하게" : "보통"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/40">느림</span>
                      <input
                        id="voice-rate-range"
                        type="range"
                        min="0.55"
                        max="0.85"
                        step="0.05"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        className="flex-1 accent-orange-500 cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                      />
                      <span className="text-[10px] text-white/40">보통</span>
                    </div>
                  </div>

                  {/* Test Speech Button */}
                  <button
                    id="playback-btn-test-voice"
                    onClick={() => {
                      if (!window.speechSynthesis) return;
                      // Instantly play sample with chosen settings
                      window.speechSynthesis.cancel();
                      const utterance = new SpeechSynthesisUtterance("숨을 깊이 들이마십니다. 차분한 평온함이 가득 채워집니다.");
                      utterance.lang = "ko-KR";
                      const allVoices = window.speechSynthesis.getVoices();
                      const matchedVoice = allVoices.find(v => v.name === selectedVoiceName);
                      if (matchedVoice) utterance.voice = matchedVoice;
                      utterance.pitch = 0.88;
                      utterance.rate = voiceRate;
                      utterance.volume = 0.9;
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="w-full mt-1.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 rounded-lg border border-orange-500/20 text-xs font-medium cursor-pointer transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-1.5"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    테스트용 샘플 목소리 들어보기
                  </button>

                  <div className="text-[9px] text-white/40 leading-relaxed text-center mt-1">
                    * 구글 크롬, Edge, 웨일 브라우저 이용 시<br />가장 자연스러운 전문가 수준의 신경망 AI 보이스가 제공됩니다.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Therapy Settings Panel Overlay */}
            <AnimatePresence>
              {showTherapyPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="interactive-control absolute bottom-[130px] left-1/2 -translate-x-1/2 w-[90%] max-w-sm p-5 bg-stone-950/95 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl text-white pointer-events-auto flex flex-col gap-4 z-40"
                >
                  <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
                    <span className="text-sm font-semibold tracking-wide text-emerald-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 fill-emerald-400/10" />
                      인테그레이티드 테라피 시너지 설정
                    </span>
                    <button 
                      onClick={() => setShowTherapyPanel(false)}
                      className="text-white/40 hover:text-white/80 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 1. 요가 호흡 테라피 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-emerald-400/80 font-semibold">
                      1. 요가 프라나야마 호흡 테라피 (Yoga Breathing)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "coherent", name: "4-4 균형", desc: "자율신경 정돈" },
                        { id: "sleep", name: "4-7-8 숙면", desc: "불면증 극복" },
                        { id: "box", name: "4-4-4-4 정화", desc: "고도의 집중" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            setSelectedBreathingId(item.id as BreathingId);
                            setBreathePhase("inhale"); // Reset to inhale cleanly
                          }}
                          className={`px-2 py-2 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
                            selectedBreathingId === item.id
                              ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                              : "bg-white/5 border-white/10 text-stone-400 hover:border-white/20"
                          }`}
                        >
                          <div className="text-xs font-semibold">{item.name}</div>
                          <div className="text-[8px] text-white/40 mt-0.5 leading-tight">{item.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. 주파수 음향 테라피 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-amber-400/80 font-semibold">
                      2. 솔페지오 주파수 사운드 테라피 (Sound Therapy)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "off", name: "해제", hz: "자연음" },
                        { id: "432", name: "432 Hz", hz: "불안해소" },
                        { id: "528", name: "528 Hz", hz: "우주의기적" },
                        { id: "639", name: "639 Hz", hz: "소통안정" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedMusicId(item.id as MusicId)}
                          className={`px-1 py-2 rounded-lg border text-center transition-all duration-300 cursor-pointer ${
                            selectedMusicId === item.id
                              ? "bg-amber-500/15 border-amber-500 text-amber-300"
                              : "bg-white/5 border-white/10 text-stone-400 hover:border-white/20"
                          }`}
                        >
                          <div className="text-xs font-semibold tracking-tighter">{item.name}</div>
                          <div className="text-[8px] text-white/40 mt-0.5 leading-none">{item.hz}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. 크로모테라피 미술 조명 */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] uppercase tracking-wider text-purple-400/80 font-semibold">
                      3. 크로모테라피 색채 치유 (Chromotherapy Light)
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: "off", name: "해제", color: "transparent", text: "테마 고유" },
                        { id: "green", name: "그린", color: "#10b981", text: "긴장 완화" },
                        { id: "blue", name: "블루", color: "#3b82f6", text: "수면 유도" },
                        { id: "violet", name: "바이올렛", color: "#a855f7", text: "깊은 명상" }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedColorId(item.id as ColorId)}
                          className={`px-1 py-2 rounded-lg border text-center transition-all duration-300 cursor-pointer ${
                            selectedColorId === item.id
                              ? "bg-purple-500/15 border-purple-500 text-purple-300"
                              : "bg-white/5 border-white/10 text-stone-400 hover:border-white/20"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            {item.color !== "transparent" && (
                              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                            )}
                            <span className="text-xs font-semibold">{item.name}</span>
                          </div>
                          <div className="text-[8px] text-white/40 leading-none">{item.text}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom main interaction bar */}
            <div className="flex justify-center w-full pb-14">
              <div className="interactive-control pointer-events-auto flex items-center gap-4 px-5 py-3.5 bg-stone-900/90 backdrop-blur-lg rounded-full border border-white/10 shadow-2xl">
                {/* Play/Pause control */}
                <button
                  id="playback-btn-pause"
                  onClick={togglePause}
                  className="p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all duration-300 cursor-pointer active:scale-90 shadow-md shadow-orange-500/20"
                >
                  {isPaused ? <Play className="w-5 h-5 fill-white" /> : <Pause className="w-5 h-5 fill-white" />}
                </button>

                {/* Vertical Divider */}
                <div className="h-6 w-[1px] bg-white/10" />

                {/* Breath Guide Toggle */}
                <button
                  id="playback-btn-breath-toggle"
                  onClick={() => setShowBreathGuide(!showBreathGuide)}
                  className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 flex items-center gap-1 border ${
                    showBreathGuide 
                      ? "border-orange-500/30 bg-orange-500/10 text-orange-300" 
                      : "border-white/10 bg-transparent text-stone-500 hover:text-stone-300"
                  }`}
                  title="호흡 가이드 켜기/끄기"
                >
                  <Sparkles className="w-4 h-4" />
                </button>

                {/* Voice Guidance Toggle */}
                <button
                  id="playback-btn-voice-toggle"
                  onClick={() => {
                    const newVoiceState = !isVoiceEnabled;
                    setIsVoiceEnabled(newVoiceState);
                    if (!newVoiceState && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      setCurrentSubtitle(null);
                    }
                  }}
                  className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 flex items-center gap-1 border ${
                    isVoiceEnabled 
                      ? "border-orange-500/30 bg-orange-500/10 text-orange-300" 
                      : "border-white/10 bg-transparent text-stone-500 hover:text-stone-300"
                  }`}
                  title="전문가 목소리 가이드 켜기/끄기"
                >
                  {isVoiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>

                {/* Premium Voice Settings Cog */}
                <button
                  id="playback-btn-voice-settings"
                  onClick={() => {
                    setShowVoicePanel(!showVoicePanel);
                    setShowTherapyPanel(false);
                  }}
                  className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 flex items-center gap-1 border ${
                    showVoicePanel 
                      ? "border-orange-500/50 bg-orange-500/20 text-orange-400" 
                      : "border-white/10 bg-transparent text-stone-400 hover:text-stone-200"
                  }`}
                  title="목소리 설정 (전문가 AI 보이스 선택)"
                >
                  <Settings className="w-4 h-4" />
                </button>

                {/* Integrated Therapy Synergy settings */}
                <button
                  id="playback-btn-therapy-settings"
                  onClick={() => {
                    setShowTherapyPanel(!showTherapyPanel);
                    setShowVoicePanel(false);
                  }}
                  className={`p-2.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 flex items-center gap-1 border ${
                    showTherapyPanel 
                      ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400" 
                      : "border-white/10 bg-transparent text-stone-400 hover:text-stone-200"
                  }`}
                  title="인테그레이티드 테라피 시너지 설정 (요가/음악/미술)"
                >
                  <Heart className={`w-4 h-4 ${showTherapyPanel ? "fill-emerald-400" : ""}`} />
                </button>

                {/* Volume slider control */}
                <div className="flex items-center gap-2">
                  <button
                    id="playback-btn-mute"
                    onClick={toggleMute}
                    className="text-stone-400 hover:text-stone-200 transition-colors p-1"
                  >
                    {isMuted || volumeLevel === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    id="playback-volume-range"
                    type="range"
                    min="0"
                    max="0.8"
                    step="0.05"
                    value={isMuted ? 0 : volumeLevel}
                    onChange={handleVolumeChange}
                    className="w-24 accent-orange-500 cursor-pointer h-1 bg-white/20 rounded-lg appearance-none"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
