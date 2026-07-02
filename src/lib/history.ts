import { ThemeId, MoodQuickId } from "../types";

// Local-first meditation history. This module is the single access point for
// session data so it can later be swapped for an account-backed / synced store
// without touching the UI.

export interface MeditationSession {
  id: string;
  date: string; // ISO timestamp
  theme: ThemeId;
  mood: MoodQuickId;
  durationMin: number;
  completed: boolean;
}

export interface MeditationStats {
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number; // consecutive days up to today (or yesterday if today is empty)
  longestStreak: number;
  last7Days: boolean[]; // oldest -> newest; index 6 = today
  recent: MeditationSession[]; // most recent first
}

const STORAGE_KEY = "meong.sessions.v1";

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function getSessions(): MeditationSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSession(entry: Omit<MeditationSession, "id" | "date">): MeditationSession {
  const session: MeditationSession = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    ...entry,
  };
  if (typeof window !== "undefined") {
    try {
      const sessions = getSessions();
      sessions.push(session);
      // keep the store bounded
      const trimmed = sessions.slice(-500);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // storage full / unavailable — non-fatal
    }
  }
  return session;
}

export function getStats(): MeditationStats {
  const sessions = getSessions();
  const completed = sessions.filter((s) => s.completed);

  const totalSessions = completed.length;
  const totalMinutes = completed.reduce((sum, s) => sum + (s.durationMin || 0), 0);

  // Set of local dates that have at least one completed session
  const activeDays = new Set(completed.map((s) => dayKey(new Date(s.date))));

  // Current streak: count consecutive active days ending today (or yesterday)
  let currentStreak = 0;
  const cursor = new Date();
  if (!activeDays.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (activeDays.has(dayKey(cursor))) {
    currentStreak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  // Longest streak across all history
  let longestStreak = 0;
  const sortedDays = Array.from(activeDays).sort();
  let run = 0;
  let prev: Date | null = null;
  for (const key of sortedDays) {
    const [y, m, d] = key.split("-").map(Number);
    const cur = new Date(y, m - 1, d);
    if (prev) {
      const diff = Math.round((cur.getTime() - prev.getTime()) / 86400000);
      run = diff === 1 ? run + 1 : 1;
    } else {
      run = 1;
    }
    longestStreak = Math.max(longestStreak, run);
    prev = cur;
  }

  // Last 7 days activity (oldest -> newest, today last)
  const last7Days: boolean[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(activeDays.has(dayKey(d)));
  }

  const recent = [...completed].reverse().slice(0, 6);

  return { totalSessions, totalMinutes, currentStreak, longestStreak, last7Days, recent };
}

export function clearSessions() {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
