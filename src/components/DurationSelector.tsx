import React from "react";
import { motion } from "motion/react";
import { Clock, ArrowLeft, Play, Sparkles } from "lucide-react";
import { DURATION_OPTIONS } from "../data";

interface DurationSelectorProps {
  duration: number;
  setDuration: (mins: number) => void;
  onBack: () => void;
  onStart: () => void;
  lang: "ko" | "en";
}

export function DurationSelector({
  duration,
  setDuration,
  onBack,
  onStart,
  lang,
}: DurationSelectorProps) {
  const isEn = lang === "en";

  const getLabel = (value: number) => {
    if (value === 1) {
      return isEn ? "1 Min (Quick Test)" : "1분 (빠른 테스트)";
    }
    return isEn ? `${value} Mins` : `${value}분`;
  };

  return (
    <div id="duration-selector-root" className="w-full max-w-lg mx-auto px-4">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.25em] text-orange-500/80 mb-4 font-mono font-medium"
        >
          {isEn ? "03. Session Duration" : "03. Session Duration / 시간 선택"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-light"
        >
          {isEn
            ? "Decide your immersion time to fully ease the tension of mind and body and find inner serenity."
            : "몸과 마음의 긴장을 온전히 풀고 내면의 평온을 찾기 위한 몰입 시간을 결정합니다."}
        </motion.p>
      </div>

      {/* Glassmorphic Duration Option Cards */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10"
      >
        {DURATION_OPTIONS.map((opt) => {
          const isSelected = duration === opt.value;
          return (
            <button
              key={opt.value}
              id={`duration-opt-${opt.value}`}
              onClick={() => setDuration(opt.value)}
              className={`flex items-center justify-between p-4 rounded-xl border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 cursor-pointer ${
                isSelected
                  ? "border-orange-500/80 bg-white/[0.08] shadow-[0_0_15px_rgba(249,115,22,0.05)] text-white font-medium"
                  : "border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-white/5 border border-white/5 ${isSelected ? "text-orange-400" : "text-slate-500"}`}>
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="font-light text-base block">{getLabel(opt.value)}</span>
                </div>
              </div>
              
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Back and Start Controls */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="flex items-center justify-between gap-4"
      >
        <button
          id="duration-btn-back"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs uppercase tracking-wider font-mono transition-all duration-300 cursor-pointer font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? "Intent" : "Intent / 의도"}</span>
        </button>

        <button
          id="duration-btn-start"
          onClick={onStart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-orange-50 text-xs uppercase tracking-wider font-mono font-medium transition-all duration-300 shadow-md cursor-pointer active:scale-95"
        >
          <span>{isEn ? "Start (Deep Sink)" : "Start (Deep Sink) / 시작"}</span>
          <Play className="w-3.5 h-3.5 fill-black text-black" />
        </button>
      </motion.div>
    </div>
  );
}
