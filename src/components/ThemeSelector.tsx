import React from "react";
import { motion } from "motion/react";
import { Flame, Droplet, Waves, Cloud, CloudRain, Sparkles, BookOpen } from "lucide-react";
import { THEME_OPTIONS } from "../data";
import { ThemeId, ThemeCategory } from "../types";

interface ThemeSelectorProps {
  onSelectTheme: (id: ThemeId) => void;
  selectedTheme: ThemeId | null;
  lang: "ko" | "en";
}

const getIcon = (name: string, cls: string) => {
  switch (name) {
    case "Flame":     return <Flame     className={cls} />;
    case "Droplet":   return <Droplet   className={cls} />;
    case "Waves":     return <Waves     className={cls} />;
    case "Cloud":     return <Cloud     className={cls} />;
    case "CloudRain": return <CloudRain className={cls} />;
    case "Sansa":     return <span className={`${cls} text-base leading-none`}>🏯</span>;
    default:          return <Sparkles  className={cls} />;
  }
};

const CATEGORY_META: Record<ThemeCategory, { ko: string; en: string; badge?: string }> = {
  nature: { ko: "자연멍", en: "Nature" },
  korean: { ko: "한국멍", en: "Korean", badge: "🇰🇷" },
};

export function ThemeSelector({ onSelectTheme, selectedTheme, lang }: ThemeSelectorProps) {
  const isEn = lang === "en";

  const categories: ThemeCategory[] = ["nature", "korean"];

  return (
    <div id="theme-selector-root" className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[10px] uppercase tracking-[0.25em] text-orange-500/80 mb-4 font-mono font-medium"
        >
          {isEn ? "01. Choose Atmosphere" : "01. Choose Atmosphere / 테마 선택"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-400 text-sm sm:text-base max-w-md mx-auto leading-relaxed font-light"
        >
          {isEn
            ? "Pause your noisy day for a moment and select an atmosphere you want to immerse in."
            : "소음 가득한 하루를 잠시 멈추고 몰입하고 싶은 분위기를 선택해 보세요."}
        </motion.p>
      </div>

      {categories.map((cat) => {
        const themes = THEME_OPTIONS.filter((t) => t.category === cat);
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} className="mb-8">
            {/* Category label */}
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-3 pl-1"
            >
              <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                {isEn ? meta.en : meta.ko}
              </span>
              {meta.badge && <span className="text-[11px]">{meta.badge}</span>}
              <div className="flex-1 h-px bg-white/5" />
            </motion.div>

            {/* Theme cards */}
            <div className={`grid grid-cols-2 ${themes.length >= 4 ? "sm:grid-cols-3 md:grid-cols-5" : "sm:grid-cols-2 md:grid-cols-3"} gap-3`}>
              {themes.map((theme, index) => {
                const isSelected = selectedTheme === theme.id;
                return (
                  <motion.button
                    key={theme.id}
                    id={`theme-card-${theme.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.07 }}
                    onClick={() => onSelectTheme(theme.id)}
                    className={`group relative text-left p-5 rounded-xl border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 overflow-hidden cursor-pointer ${
                      isSelected
                        ? "border-orange-500/80 bg-white/[0.08] shadow-[0_0_20px_rgba(249,115,22,0.08)]"
                        : "border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    {/* Korean badge */}
                    {theme.category === "korean" && (
                      <div className="absolute top-2 right-2 text-[8px] font-mono tracking-wider text-amber-400/60 uppercase">
                        한국멍
                      </div>
                    )}

                    <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                      <div className="flex items-center justify-between w-full">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-tr ${theme.gradient} flex items-center justify-center border border-white/10 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity`}>
                          {getIcon(theme.iconName, "w-4 h-4 text-white/90")}
                        </div>
                        {isSelected && (
                          <span className="text-[9px] text-orange-400 font-mono uppercase tracking-widest font-medium">
                            Active
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-light text-white tracking-tight mb-0.5">
                          {isEn ? theme.englishName : theme.name}
                        </h3>
                        <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider block mb-1.5">
                          {isEn ? theme.name : theme.englishName}
                        </span>
                        <p className="text-slate-400 text-[11px] leading-relaxed font-light opacity-70 group-hover:opacity-90 transition-opacity">
                          {isEn ? theme.englishDescription : theme.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
