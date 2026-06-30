import React from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowLeft, Heart, MessageSquareDot } from "lucide-react";
import { MOOD_OPTIONS } from "../data";
import { MoodQuickId } from "../types";

interface MoodInputProps {
  moodText: string;
  setMoodText: (text: string) => void;
  selectedMood: MoodQuickId;
  setSelectedMood: (mood: MoodQuickId) => void;
  onNext: () => void;
  onBack: () => void;
  lang: "ko" | "en";
}

export function MoodInput({
  moodText,
  setMoodText,
  selectedMood,
  setSelectedMood,
  onNext,
  onBack,
  lang,
}: MoodInputProps) {
  const isEn = lang === "en";

  return (
    <div id="mood-input-root" className="w-full max-w-xl mx-auto px-4">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.25em] text-orange-500/80 mb-4 font-mono font-medium"
        >
          {isEn ? "02. Set Your Intent" : "02. Set Your Intent / 기분 선택"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-light"
        >
          {isEn 
            ? "To ease the tension built up in your mind today, choose your current emotion and express yourself freely."
            : "오늘 마음에 쌓인 긴장을 덜어내기 위해, 현재 느끼는 감정을 선택하고 자유롭게 적어 보세요."}
        </motion.p>
      </div>

      {/* Quick Mood Selection Chips */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="mb-10 text-center"
      >
        <label className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-mono block mb-4 font-medium">
          {isEn ? "Category" : "Category / 기분 종류"}
        </label>
        <div className="flex flex-wrap gap-2.5 justify-center">
          {MOOD_OPTIONS.map((mood) => {
            const isSelected = selectedMood === mood.id;
            return (
              <button
                key={mood.id}
                id={`mood-chip-${mood.id}`}
                onClick={() => setSelectedMood(mood.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs tracking-wider transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? "border-orange-500/50 bg-orange-500/10 text-orange-200 font-normal"
                    : "border-white/10 bg-white/[0.03] text-slate-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-slate-200"
                }`}
                title={isEn ? mood.englishDescription : mood.description}
              >
                <span className="text-base">{mood.emoji}</span>
                <span>{isEn ? mood.englishName : mood.name}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Raw Text Box Input */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
        className="mb-12"
      >
        <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
          <label className="text-slate-500 text-[10px] uppercase tracking-[0.2em] font-mono font-medium flex items-center gap-1.5">
            <MessageSquareDot className="w-3.5 h-3.5 opacity-60" />
            {isEn ? "Write Freeform" : "Write Freeform / 마음 표현하기"}
          </label>
          <span className="text-slate-600 text-[10px] font-mono">{moodText.length}/100</span>
        </div>
        
        <textarea
          id="mood-textarea"
          value={moodText}
          onChange={(e) => setMoodText(e.target.value.slice(0, 100))}
          placeholder={isEn ? "e.g., I had a very stressful day at work and want to empty my head in silence..." : "예: 오늘 회사에서 너무 힘든 일이 있어서 조용히 머리를 비우고 싶어요..."}
          className="w-full h-24 bg-transparent py-3 text-sm text-white placeholder-slate-700 leading-relaxed focus:outline-none transition-colors resize-none font-light"
        />
        <div className="h-[1px] w-full bg-white/15" />
      </motion.div>

      {/* Back and Forward Action Row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="flex items-center justify-between gap-4"
      >
        <button
          id="mood-btn-back"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-transparent hover:bg-white/5 text-slate-400 hover:text-white text-xs uppercase tracking-wider font-mono transition-all duration-300 cursor-pointer font-light"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isEn ? "Atmosphere" : "Atmosphere / 테마"}</span>
        </button>

        <button
          id="mood-btn-next"
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black hover:bg-orange-50 text-xs uppercase tracking-wider font-mono font-medium transition-all duration-300 cursor-pointer active:scale-95"
        >
          <span>{isEn ? "Duration" : "Duration / 시간"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    </div>
  );
}
