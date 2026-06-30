import React from "react";
import { motion } from "motion/react";
import { Flame, Droplet, Waves, Cloud, CloudRain, Sparkles } from "lucide-react";
import { THEME_OPTIONS } from "../data";
import { ThemeId } from "../types";

interface ThemeSelectorProps {
  onSelectTheme: (id: ThemeId) => void;
  selectedTheme: ThemeId | null;
  lang: "ko" | "en";
}

export function ThemeSelector({ onSelectTheme, selectedTheme, lang }: ThemeSelectorProps) {
  // Map icons from string to Lucide React component in a highly minimal, clean style
  const getIcon = (name: string) => {
    const iconClass = "w-4.5 h-4.5 text-white/90";
    switch (name) {
      case "Flame":
        return <Flame className={iconClass} />;
      case "Droplet":
        return <Droplet className={iconClass} />;
      case "Waves":
        return <Waves className={iconClass} />;
      case "Cloud":
        return <Cloud className={iconClass} />;
      case "CloudRain":
        return <CloudRain className={iconClass} />;
      default:
        return <Sparkles className={iconClass} />;
    }
  };

  const isEn = lang === "en";

  return (
    <div id="theme-selector-root" className="w-full max-w-4xl mx-auto px-4">
      <div className="text-center mb-12">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-8">
        {THEME_OPTIONS.map((theme, index) => {
          const isSelected = selectedTheme === theme.id;
          return (
            <motion.button
              key={theme.id}
              id={`theme-card-${theme.id}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.08 }}
              onClick={() => onSelectTheme(theme.id)}
              className={`group relative text-left p-6 rounded-xl border bg-white/[0.03] backdrop-blur-xl transition-all duration-300 overflow-hidden cursor-pointer ${
                isSelected
                  ? "border-orange-500/80 bg-white/[0.08] shadow-[0_0_20px_rgba(249,115,22,0.08)]"
                  : "border-white/5 hover:border-white/10 hover:bg-white/[0.06]"
              }`}
            >
              {/* Subtle accent highlight line inside card */}
              <div
                className={`absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent`}
              />

              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div className="flex items-center justify-between w-full">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-tr ${theme.gradient} flex items-center justify-center border border-white/10 shadow-sm opacity-80 group-hover:opacity-100 transition-opacity duration-300`}>
                    {getIcon(theme.iconName)}
                  </div>
                  {isSelected && (
                    <span className="text-[9px] text-orange-400 font-mono uppercase tracking-widest font-medium">
                      Active
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-light text-white tracking-tight mb-0.5">
                    {isEn ? theme.englishName : theme.name}
                  </h3>
                  <span className="text-slate-500 text-[10px] font-mono uppercase tracking-wider block mb-2">
                    {isEn ? theme.name : theme.englishName}
                  </span>
                  <p className="text-slate-400 text-xs leading-relaxed font-light opacity-70 group-hover:opacity-90 transition-opacity">
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
}
