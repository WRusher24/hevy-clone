import { AppState, Exercise } from "../Types";
import { config } from "../config";
import { buildSeedExercises } from "./exercises";
import { buildSeedState } from "./seed";

const STORAGE_VERSION = 1;
const STORAGE_KEY = `${config.storageKey}:state:v${STORAGE_VERSION}`;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Built-in exercises ship with the bundle, so always merge them in. That way
 * new library entries appear for existing users without wiping custom ones.
 */
function mergeExerciseLibrary(stored: Exercise[] | undefined): Exercise[] {
  const builtIn = buildSeedExercises();
  const custom = (stored ?? []).filter((exercise) => exercise.isCustom);
  const seen = new Set(builtIn.map((exercise) => exercise.id));
  return [...builtIn, ...custom.filter((exercise) => !seen.has(exercise.id))];
}

export function loadState(): AppState {
  const fallback = buildSeedState();
  if (!isBrowser()) return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (!parsed || typeof parsed !== "object" || !parsed.profile) return fallback;

    return {
      profile: { ...fallback.profile, ...parsed.profile },
      exercises: mergeExerciseLibrary(parsed.exercises),
      routines: Array.isArray(parsed.routines) ? parsed.routines : [],
      folders: Array.isArray(parsed.folders) ? parsed.folders : [],
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      activeWorkout: parsed.activeWorkout ?? null,
    };
  } catch (error) {
    console.warn("[hevy-clone] Could not read saved state, starting fresh.", error);
    return fallback;
  }
}

export function saveState(state: AppState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    // Quota errors or blocked storage should never break the UI.
    console.warn("[hevy-clone] Could not persist state.", error);
  }
}

export function clearState(): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[hevy-clone] Could not clear state.", error);
  }
}

export function freshState(): AppState {
  return config.seedDemoData ? buildSeedState() : emptyState();
}

function emptyState(): AppState {
  return {
    profile: {
      name: "New Athlete",
      handle: "athlete",
      bio: "",
      unit: "kg",
      bodyweight: null,
      weeklyGoal: 4,
    },
    exercises: buildSeedExercises(),
    routines: [],
    folders: [],
    workouts: [],
    posts: [],
    activeWorkout: null,
  };
}

export function exportStateJson(state: AppState): string {
  return JSON.stringify(state, null, 2);
}

export { STORAGE_KEY };
