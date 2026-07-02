import React from "react";
import { motion } from "motion/react";
import { ChevronLeft, Check, Lock, Play, CalendarDays } from "lucide-react";
import { PROGRAMS, getProgram } from "../programs";
import { THEME_OPTIONS } from "../data";
import { getCompletedDays, isDayUnlocked, getProgramProgress } from "../lib/programProgress";
import { Program, ProgramDay, ThemeId } from "../types";

const themeName = (id: ThemeId, isEn: boolean) => {
  const t = THEME_OPTIONS.find((o) => o.id === id);
  return t ? (isEn ? t.englishName : t.name) : id;
};

// ---------- Program list ----------
interface ProgramsViewProps {
  onSelectProgram: (id: string) => void;
  onBack: () => void;
  lang: "ko" | "en";
}

export function ProgramsView({ onSelectProgram, onBack, lang }: ProgramsViewProps) {
  const isEn = lang === "en";
  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <div className="text-center mb-10">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-300 mb-5 cursor-pointer transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" /> {isEn ? "Back" : "뒤로"}
        </button>
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-orange-500/80 mb-4 font-mono font-medium">
          {isEn ? "Guided Programs" : "가이드 프로그램"}
        </h2>
        <p className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-light">
          {isEn
            ? "Come back each day and move through a multi-day journey, one session at a time."
            : "매일 조금씩, 하루 한 세션으로 완성하는 다회차 힐링 여정입니다."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PROGRAMS.map((program, index) => {
          const progress = getProgramProgress(program.id, program.days.length);
          const pct = Math.round((progress.completedCount / progress.totalDays) * 100);
          return (
            <motion.button
              key={program.id}
              id={`program-card-${program.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              onClick={() => onSelectProgram(program.id)}
              className="group relative text-left p-6 rounded-xl border border-white/5 bg-white/[0.03] backdrop-blur-xl hover:border-white/15 hover:bg-white/[0.06] transition-all duration-300 overflow-hidden cursor-pointer"
            >
              <div className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-to-tr ${program.gradient} opacity-20 blur-2xl group-hover:opacity-30 transition-opacity`} />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <CalendarDays className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
                    {program.days.length}{isEn ? " days" : "일 과정"}
                  </span>
                </div>
                <h3 className="text-lg font-light text-white tracking-tight mb-1">
                  {isEn ? program.englishName : program.name}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed font-light opacity-80 mb-4">
                  {isEn ? program.englishDescription : program.description}
                </p>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-white/50">
                    {progress.completedCount}/{progress.totalDays}
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Program detail ----------
interface ProgramDetailProps {
  programId: string;
  onStartDay: (program: Program, day: ProgramDay) => void;
  onBack: () => void;
  lang: "ko" | "en";
}

export function ProgramDetail({ programId, onStartDay, onBack, lang }: ProgramDetailProps) {
  const isEn = lang === "en";
  const program = getProgram(programId);
  if (!program) return null;

  const completed = getCompletedDays(programId);
  const progress = getProgramProgress(programId, program.days.length);
  const pct = Math.round((progress.completedCount / progress.totalDays) * 100);

  return (
    <div className="w-full max-w-xl mx-auto px-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-300 mb-5 cursor-pointer transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" /> {isEn ? "All programs" : "프로그램 목록"}
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-light text-white tracking-tight mb-1">
          {isEn ? program.englishName : program.name}
        </h2>
        <p className="text-slate-400 text-sm font-light leading-relaxed mb-4">
          {isEn ? program.englishDescription : program.description}
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-[11px] font-mono text-white/50">
            {progress.completedCount}/{progress.totalDays}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {program.days.map((d) => {
          const isDone = completed.includes(d.day);
          const unlocked = isDayUnlocked(programId, d.day);
          const isNext = !isDone && unlocked && d.day === progress.nextDay;

          return (
            <button
              key={d.day}
              id={`program-day-${d.day}`}
              disabled={!unlocked}
              onClick={() => unlocked && onStartDay(program, d)}
              className={`group flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-300 ${
                !unlocked
                  ? "border-white/5 bg-white/[0.01] opacity-50 cursor-not-allowed"
                  : isNext
                  ? "border-orange-500/50 bg-orange-500/[0.07] hover:bg-orange-500/10 cursor-pointer"
                  : "border-white/8 bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.06] cursor-pointer"
              }`}
            >
              {/* State badge */}
              <div
                className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center border ${
                  isDone
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-400"
                    : !unlocked
                    ? "bg-white/[0.03] border-white/10 text-stone-600"
                    : "bg-orange-500/15 border-orange-500/40 text-orange-300"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : !unlocked ? <Lock className="w-3.5 h-3.5" /> : <span className="text-xs font-mono font-semibold">{d.day}</span>}
              </div>

              {/* Day info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-white/35">
                    {isEn ? `Day ${d.day}` : `${d.day}일차`}
                  </span>
                  {isNext && (
                    <span className="text-[8px] font-mono uppercase tracking-wider text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                      {isEn ? "Today" : "오늘"}
                    </span>
                  )}
                </div>
                <div className="text-sm text-white font-light truncate">
                  {isEn ? d.englishTitle : d.title}
                </div>
                <div className="text-[10px] text-white/40 font-mono mt-0.5">
                  {themeName(d.theme, isEn)} · {d.durationMin}{isEn ? "min" : "분"}
                </div>
              </div>

              {/* Action */}
              {unlocked && (
                <div className="shrink-0 text-stone-500 group-hover:text-orange-400 transition-colors">
                  <Play className="w-4 h-4 fill-current" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
