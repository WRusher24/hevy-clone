import { WeightUnit, Workout } from "../Types";

export function formatNumber(value: number, decimals = 0): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

export function formatWeight(value: number | null, unit: WeightUnit): string {
  if (value === null || Number.isNaN(value)) return "—";
  const decimals = Number.isInteger(value) ? 0 : 1;
  return `${formatNumber(value, decimals)} ${unit}`;
}

export function formatVolume(value: number, unit: WeightUnit): string {
  return `${formatNumber(Math.round(value))} ${unit}`;
}

/** 3_725_000 -> "1h 2m" */
export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0m";
  if (ms < 60_000) return "<1m";
  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

/** 65 -> "1:05" */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Stopwatch style: 05:33 under an hour, 1:05:33 above. */
export function formatStopwatch(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function parseDate(iso: string): Date {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

export function formatDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return parseDate(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatShortDate(iso: string): string {
  return parseDate(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function timeAgo(iso: string): string {
  const then = parseDate(iso).getTime();
  const diff = Date.now() - then;
  if (!Number.isFinite(diff)) return "";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return formatShortDate(iso);
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function dayKey(iso: string): string {
  const d = parseDate(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}
export function setSummary(
  sets: { weight: number | null; reps: number | null }[],
  unit: WeightUnit
): string {
  if (sets.length === 0) return "No sets";
  const weights = sets.map((s) => s.weight).filter((w): w is number => w !== null);
  const reps = sets.map((s) => s.reps).filter((r): r is number => r !== null);

  const parts = [`${sets.length} sets`];
  if (reps.length > 0) parts.push(`${Math.max(...reps)} reps`);
  if (weights.length > 0) parts.push(`@ ${formatNumber(Math.max(...weights), 1)} ${unit}`);
  return parts.join(" · ");
}

export function workoutTotalVolume(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    return (
      total +
      exercise.sets.reduce((sum, set) => {
        if (set.weight === null || set.reps === null) return sum;
        return sum + set.weight * set.reps;
      }, 0)
    );
  }, 0);
}
