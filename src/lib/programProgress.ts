// Local-first program progress. Same access-point pattern as history.ts so it
// can later be swapped for an account-backed store without touching the UI.

const STORAGE_KEY = "meong.programs.v1";

type ProgressMap = Record<string, number[]>; // programId -> completed day numbers

function readAll(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // storage unavailable — non-fatal
  }
}

export function getCompletedDays(programId: string): number[] {
  return readAll()[programId] || [];
}

export function markDayComplete(programId: string, day: number) {
  const map = readAll();
  const days = new Set(map[programId] || []);
  days.add(day);
  map[programId] = Array.from(days).sort((a, b) => a - b);
  writeAll(map);
}

// Sequential unlock: a day is available once the previous one is completed.
export function isDayUnlocked(programId: string, day: number): boolean {
  if (day <= 1) return true;
  return getCompletedDays(programId).includes(day - 1);
}

export function getProgramProgress(programId: string, totalDays: number) {
  const completed = getCompletedDays(programId);
  const completedCount = completed.filter((d) => d >= 1 && d <= totalDays).length;
  const nextDay = Math.min(completedCount + 1, totalDays);
  return { completedCount, totalDays, nextDay, isComplete: completedCount >= totalDays };
}
