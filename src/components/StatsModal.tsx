import React from "react";
import { motion } from "motion/react";
import { X, Flame, Timer, Sparkles, Trophy } from "lucide-react";
import { getStats } from "../lib/history";
import { THEME_OPTIONS, MOOD_OPTIONS } from "../data";
import { ThemeId, MoodQuickId } from "../types";

interface StatsModalProps {
  onClose: () => void;
  lang: "ko" | "en";
}

const themeName = (id: ThemeId, isEn: boolean) => {
  const t = THEME_OPTIONS.find((o) => o.id === id);
  return t ? (isEn ? t.englishName : t.name) : id;
};

const moodEmoji = (id: MoodQuickId) => MOOD_OPTIONS.find((o) => o.id === id)?.emoji || "🌙";

export function StatsModal({ onClose, lang }: StatsModalProps) {
  const isEn = lang === "en";
  const stats = getStats();

  const weekdayLabels = (() => {
    const ko = ["일", "월", "화", "수", "목", "금", "토"];
    const en = ["S", "M", "T", "W", "T", "F", "S"];
    const labels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push((isEn ? en : ko)[d.getDay()]);
    }
    return labels;
  })();

  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = stats.totalMinutes % 60;
  const timeLabel = hours > 0 ? (isEn ? `${hours}h ${mins}m` : `${hours}시간 ${mins}분`) : isEn ? `${mins}m` : `${mins}분`;

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return isEn
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : `${d.getMonth() + 1}월 ${d.getDate()}일`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-stone-950/95 border border-white/10 rounded-2xl shadow-2xl p-6 text-white"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <h2 className="text-base font-semibold tracking-tight">
              {isEn ? "My Meong Journey" : "나의 멍 기록"}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white/80 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {stats.totalSessions === 0 ? (
          <div className="text-center py-10 text-stone-400 text-sm leading-relaxed">
            {isEn
              ? "No sessions yet. Finish your first Meong to start your streak."
              : "아직 기록이 없어요. 첫 멍을 끝까지 완료하면 연속 기록이 시작됩니다."}
          </div>
        ) : (
          <>
            {/* Streak hero */}
            <div className="flex items-center justify-center gap-3 mb-6 py-4 rounded-xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/15">
              <Flame className="w-8 h-8 text-orange-500 fill-orange-500/30" />
              <div className="text-left">
                <div className="text-3xl font-bold leading-none">{stats.currentStreak}</div>
                <div className="text-[11px] text-orange-300/80 tracking-wide mt-1">
                  {isEn ? "day streak" : "일 연속"}
                </div>
              </div>
            </div>

            {/* Last 7 days */}
            <div className="mb-6">
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">
                {isEn ? "Last 7 days" : "최근 7일"}
              </div>
              <div className="flex justify-between">
                {stats.last7Days.map((active, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                        active
                          ? "bg-orange-500/20 border-orange-500/60"
                          : "bg-white/[0.03] border-white/10"
                      }`}
                    >
                      {active && <Flame className="w-3.5 h-3.5 text-orange-400" />}
                    </div>
                    <span className="text-[9px] text-white/40">{weekdayLabels[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center">
                <Sparkles className="w-4 h-4 text-orange-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold leading-none">{stats.totalSessions}</div>
                <div className="text-[9px] text-white/40 mt-1">{isEn ? "sessions" : "세션"}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center">
                <Timer className="w-4 h-4 text-cyan-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold leading-none">{timeLabel}</div>
                <div className="text-[9px] text-white/40 mt-1">{isEn ? "total" : "총 시간"}</div>
              </div>
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center">
                <Trophy className="w-4 h-4 text-amber-400 mx-auto mb-1.5" />
                <div className="text-lg font-bold leading-none">{stats.longestStreak}</div>
                <div className="text-[9px] text-white/40 mt-1">{isEn ? "best streak" : "최고 연속"}</div>
              </div>
            </div>

            {/* Recent sessions */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40 mb-2 font-medium">
                {isEn ? "Recent" : "최근 기록"}
              </div>
              <div className="flex flex-col gap-1.5">
                {stats.recent.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/5 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none">{moodEmoji(s.mood)}</span>
                      <span className="text-xs text-white/80">{themeName(s.theme, isEn)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/40 font-mono">
                      <span>{s.durationMin}{isEn ? "m" : "분"}</span>
                      <span>{formatDate(s.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
