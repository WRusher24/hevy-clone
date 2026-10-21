import { MuscleGroup, Workout } from "../Types";
import { dayKey, parseDate, workoutTotalVolume } from "./format";

export interface WorkoutSummary {
  durationMs: number;
  volume: number;
  sets: number;
  reps: number;
  exerciseCount: number;
}

export function summarizeWorkout(workout: Workout): WorkoutSummary {
  const start = parseDate(workout.startedAt).getTime();
  const end = workout.finishedAt ? parseDate(workout.finishedAt).getTime() : Date.now();

  let sets = 0;
  let reps = 0;
  workout.exercises.forEach((exercise) => {
    exercise.sets.forEach((set) => {
      sets += 1;
      if (set.reps !== null) reps += set.reps;
    });
  });

  return {
    durationMs: Math.max(0, end - start),
    volume: workoutTotalVolume(workout),
    sets,
    reps,
    exerciseCount: workout.exercises.length,
  };
}

export function sortByNewest(workouts: Workout[]): Workout[] {
  return [...workouts].sort(
    (a, b) => parseDate(b.startedAt).getTime() - parseDate(a.startedAt).getTime()
  );
}

export function finishedWorkouts(workouts: Workout[]): Workout[] {
  return sortByNewest(workouts.filter((workout) => workout.finishedAt !== null));
}

export function workoutsSince(workouts: Workout[], days: number): Workout[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return finishedWorkouts(workouts).filter(
    (workout) => parseDate(workout.startedAt).getTime() >= cutoff
  );
}

export interface PersonalRecord {
  exerciseId: string;
  name: string;
  weight: number;
  reps: number;
  date: string;
  unit: Workout["unit"];
}

/** Heaviest completed set per exercise across all finished workouts. */
export function personalRecords(workouts: Workout[]): PersonalRecord[] {
  const best = new Map<string, PersonalRecord>();

  finishedWorkouts(workouts).forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        if (set.weight === null || set.reps === null || set.reps <= 0) return;
        const current = best.get(exercise.exerciseId);
        if (!current || set.weight > current.weight) {
          best.set(exercise.exerciseId, {
            exerciseId: exercise.exerciseId,
            name: exercise.name,
            weight: set.weight,
            reps: set.reps,
            date: workout.startedAt,
            unit: workout.unit,
          });
        }
      });
    });
  });

  return Array.from(best.values()).sort((a, b) => b.weight - a.weight);
}

/** Consecutive days (ending today or yesterday) that contain a workout. */
export function currentStreak(workouts: Workout[]): number {
  const days = new Set(finishedWorkouts(workouts).map((workout) => dayKey(workout.startedAt)));
  if (days.size === 0) return 0;

  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  // Allow the streak to be alive if the last session was yesterday.
  if (!days.has(toDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(toDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(toDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function toDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export interface WeeklyVolumePoint {
  label: string;
  volume: number;
  workouts: number;
}

/** Volume per week for the trailing `weeks` weeks (oldest first). */
export function weeklyVolume(workouts: Workout[], weeks = 8): WeeklyVolumePoint[] {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const buckets: WeeklyVolumePoint[] = [];
  const starts: number[] = [];

  for (let i = weeks - 1; i >= 0; i -= 1) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7 - 6);
    start.setHours(0, 0, 0, 0);
    starts.push(start.getTime());
    buckets.push({
      label: start.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      volume: 0,
      workouts: 0,
    });
  }

  finishedWorkouts(workouts).forEach((workout) => {
    const time = parseDate(workout.startedAt).getTime();
    for (let i = starts.length - 1; i >= 0; i -= 1) {
      if (time >= starts[i]) {
        buckets[i].volume += workoutTotalVolume(workout);
        buckets[i].workouts += 1;
        break;
      }
    }
  });

  return buckets;
}

export interface MuscleVolumePoint {
  muscle: MuscleGroup;
  volume: number;
}

export function muscleBreakdown(workouts: Workout[], days = 30): MuscleVolumePoint[] {
  const totals = new Map<MuscleGroup, number>();

  workoutsSince(workouts, days).forEach((workout) => {
    workout.exercises.forEach((exercise) => {
      const volume = exercise.sets.reduce((sum, set) => {
        if (set.weight === null || set.reps === null) return sum;
        return sum + set.weight * set.reps;
      }, 0);
      totals.set(exercise.primaryMuscle, (totals.get(exercise.primaryMuscle) ?? 0) + volume);
    });
  });

  return Array.from(totals.entries())
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume);
}

export interface ExerciseHistoryPoint {
  workoutId: string;
  date: string;
  topWeight: number;
  volume: number;
  sets: number;
}

export function exerciseHistory(
  workouts: Workout[],
  exerciseId: string
): ExerciseHistoryPoint[] {
  const points: ExerciseHistoryPoint[] = [];

  finishedWorkouts(workouts).forEach((workout) => {
    const exercise = workout.exercises.find((item) => item.exerciseId === exerciseId);
    if (!exercise) return;

    const weights = exercise.sets
      .map((set) => set.weight)
      .filter((weight): weight is number => weight !== null);
    const volume = exercise.sets.reduce((sum, set) => {
      if (set.weight === null || set.reps === null) return sum;
      return sum + set.weight * set.reps;
    }, 0);

    points.push({
      workoutId: workout.id,
      date: workout.startedAt,
      topWeight: weights.length > 0 ? Math.max(...weights) : 0,
      volume,
      sets: exercise.sets.length,
    });
  });

  return points;
}

export function bestSetForExercise(
  workouts: Workout[],
  exerciseId: string
): { weight: number; reps: number; date: string } | null {
  let best: { weight: number; reps: number; date: string } | null = null;

  finishedWorkouts(workouts).forEach((workout) => {
    workout.exercises
      .filter((exercise) => exercise.exerciseId === exerciseId)
      .forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (set.weight === null || set.reps === null) return;
          if (!best || set.weight > best.weight) {
            best = { weight: set.weight, reps: set.reps, date: workout.startedAt };
          }
        });
      });
  });

  return best;
}
