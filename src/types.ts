export type ThemeId = 'fire' | 'water' | 'wave' | 'cloud' | 'rain';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  englishName: string;
  iconName: string;
  description: string;
  englishDescription: string;
  gradient: string;
  defaultColors: string[];
}

export type MoodQuickId = 'stress' | 'calm' | 'anxiety' | 'lethargy' | 'excitement';

export interface MoodOption {
  id: MoodQuickId;
  name: string;
  englishName: string;
  emoji: string;
  description: string;
  englishDescription: string;
}

export interface SessionConfig {
  theme: ThemeId;
  moodText: string;
  moodQuick: MoodQuickId;
  duration: number; // in minutes
}

export type BreathingId = 'coherent' | 'sleep' | 'box';
export type MusicId = '432' | '528' | '639' | 'off';
export type ColorId = 'green' | 'blue' | 'violet' | 'off';

export interface TherapyConfig {
  breathingId: BreathingId;
  musicId: MusicId;
  colorId: ColorId;
}

export interface AIParams {
  colors: string[]; // 2 or 3 hex colors representing the mood gradient
  speedMultiplier: number; // 0.2 to 2.0
  density: number; // 0.3 to 1.5
  glow: number; // 0.2 to 1.0 (opacity or intensity)
  pitch: number; // 60 to 300 (Hz or frequency parameter)
  soundSpeed: number; // 0.5 to 2.0 (modulation speed)
  greeting: string; // opening message from AI
  affirmation: string; // closing message from AI
  ambientNoiseLevel: number; // 0.1 to 0.8
}

