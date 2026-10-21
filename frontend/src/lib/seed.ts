import {
  AppState,
  FeedPost,
  MuscleGroup,
  Profile,
  Routine,
  RoutineExercise,
  WeightUnit,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../Types";
import { buildSeedExercises } from "./exercises";
import { slugify, uid } from "./id";

const KG = "kg" as WeightUnit;

export const DEMO_PROFILE: Profile = {
  name: "Alex Carter",
  handle: "alexlifts",
  bio: "Chasing a 500 kg total. Push / Pull / Legs, six days a week.",
  unit: KG,
  bodyweight: 78,
  weeklyGoal: 5,
};

interface RoutineBlueprint {
  name: string;
  notes: string;
  folder: string;
  exercises: Array<{
    exercise: string;
    sets: number;
    min: number;
    max: number;
    rest: number;
    notes?: string;
  }>;
}

const ROUTINE_BLUEPRINTS: RoutineBlueprint[] = [
  {
    name: "Push Day A",
    notes: "Heavy bench, then hypertrophy accessories.",
    folder: "PPL Program",
    exercises: [
      { exercise: "Barbell Bench Press", sets: 4, min: 6, max: 8, rest: 150, notes: "Leave one rep in the tank." },
      { exercise: "Incline Dumbbell Press", sets: 3, min: 8, max: 12, rest: 90 },
      { exercise: "Lateral Raise", sets: 3, min: 12, max: 15, rest: 60 },
      { exercise: "Triceps Pushdown", sets: 3, min: 10, max: 15, rest: 60 },
    ],
  },
  {
    name: "Pull Day A",
    notes: "Deadlift top set, then back volume.",
    folder: "PPL Program",
    exercises: [
      { exercise: "Deadlift", sets: 3, min: 4, max: 6, rest: 180, notes: "Brace hard, pull fast." },
      { exercise: "Pull Up", sets: 4, min: 6, max: 10, rest: 120 },
      { exercise: "Seated Cable Row", sets: 3, min: 8, max: 12, rest: 90 },
      { exercise: "Barbell Curl", sets: 3, min: 10, max: 12, rest: 60 },
    ],
  },
  {
    name: "Leg Day",
    notes: "Squat focus. Legs always suck.",
    folder: "PPL Program",
    exercises: [
      { exercise: "Back Squat", sets: 5, min: 4, max: 6, rest: 180, notes: "Depth over ego." },
      { exercise: "Romanian Deadlift", sets: 3, min: 8, max: 10, rest: 120 },
      { exercise: "Leg Press", sets: 3, min: 10, max: 12, rest: 90 },
      { exercise: "Standing Calf Raise", sets: 4, min: 12, max: 15, rest: 60 },
    ],
  },
];

/** Rough working weights (kg) used to generate believable demo history. */
const BASE_WEIGHTS: Record<string, number> = {
  "barbell-bench-press": 82.5,
  "incline-dumbbell-press": 28,
  "lateral-raise": 10,
  "triceps-pushdown": 35,
  deadlift: 145,
  "pull-up": 0,
  "seated-cable-row": 72.5,
  "barbell-curl": 32.5,
  "back-squat": 112.5,
  "romanian-deadlift": 92.5,
  "leg-press": 180,
  "standing-calf-raise": 65,
};

function toRoutineExercises(blueprint: RoutineBlueprint): RoutineExercise[] {
  return blueprint.exercises.map((item) => {
    const exerciseId = slugify(item.exercise);
    return {
      id: uid("re"),
      exerciseId,
      name: item.exercise,
      primaryMuscle: muscleOf(exerciseId),
      notes: item.notes ?? "",
      restSeconds: item.rest,
      sets: item.sets,
      targetRepsMin: item.min,
      targetRepsMax: item.max,
    };
  });
}

function muscleOf(exerciseId: string): MuscleGroup {
  const found = buildSeedExercises().find((exercise) => exercise.id === exerciseId);
  return found ? found.primaryMuscle : "Full Body";
}

function isoDaysAgo(days: number, hour: number, minute = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function roundToPlate(value: number): number {
  return Math.round(value / 2.5) * 2.5;
}

function buildWorkout(
  routine: Routine,
  daysAgo: number,
  hour: number,
  progression: number,
  id: string
): Workout {
  const start = isoDaysAgo(daysAgo, hour);
  const end = new Date(start.getTime() + 68 * 60 * 1000);

  const exercises: WorkoutExercise[] = routine.exercises.map((routineExercise) => {
    const base = BASE_WEIGHTS[routineExercise.exerciseId] ?? 40;
    const workingWeight = roundToPlate(base * progression);
    const sets: WorkoutSet[] = Array.from({ length: routineExercise.sets }).map((_, index) => ({
      id: uid("set"),
      weight: routineExercise.exerciseId === "pull-up" ? 0 : workingWeight,
      reps:
        index === routineExercise.sets - 1
          ? routineExercise.targetRepsMin
          : routineExercise.targetRepsMax - (index === 0 ? 0 : 1),
      completed: true,
      type: "normal" as const,
    }));

    return {
      id: uid("we"),
      exerciseId: routineExercise.exerciseId,
      name: routineExercise.name,
      primaryMuscle: routineExercise.primaryMuscle,
      notes: routineExercise.notes,
      restSeconds: routineExercise.restSeconds,
      sets,
    };
  });

  return {
    id,
    title: routine.name,
    description: "",
    startedAt: start.toISOString(),
    finishedAt: end.toISOString(),
    routineId: routine.id,
    unit: KG,
    exercises,
    shared: false,
  };
}

export function buildSeedState(): AppState {
  const folders = [{ id: "folder_ppl", name: "PPL Program" }];

  const routines: Routine[] = ROUTINE_BLUEPRINTS.map((blueprint) => {
    const createdAt = isoDaysAgo(45, 9).toISOString();
    const updatedAt = isoDaysAgo(3, 9).toISOString();
    return {
      id: `routine_${slugify(blueprint.name)}`,
      name: blueprint.name,
      notes: blueprint.notes,
      folderId: "folder_ppl",
      exercises: toRoutineExercises(blueprint),
      createdAt,
      updatedAt,
    };
  });

  const schedule: Array<{ routineIndex: number; daysAgo: number; hour: number; factor: number }> = [
    { routineIndex: 0, daysAgo: 26, hour: 18, factor: 0.9 },
    { routineIndex: 1, daysAgo: 24, hour: 18, factor: 0.9 },
    { routineIndex: 2, daysAgo: 22, hour: 17, factor: 0.9 },
    { routineIndex: 0, daysAgo: 19, hour: 18, factor: 0.94 },
    { routineIndex: 1, daysAgo: 17, hour: 18, factor: 0.95 },
    { routineIndex: 2, daysAgo: 15, hour: 17, factor: 0.95 },
    { routineIndex: 0, daysAgo: 8, hour: 18, factor: 0.98 },
    { routineIndex: 1, daysAgo: 6, hour: 18, factor: 1.0 },
    { routineIndex: 2, daysAgo: 4, hour: 17, factor: 1.0 },
    { routineIndex: 0, daysAgo: 1, hour: 18, factor: 1.02 },
  ];

  const workouts: Workout[] = schedule.map((entry, index) =>
    buildWorkout(
      routines[entry.routineIndex],
      entry.daysAgo,
      entry.hour,
      entry.factor,
      `workout_demo_${index + 1}`
    )
  );

  const postDescriptions: Record<string, string> = {
    "Push Day A": "Bench felt heavy today but the last set moved well. Slow and steady.",
    "Pull Day A": "Deadlifts are finally clicking. Grip work is paying off.",
    "Leg Day": "Leg day done. Walking is optional for the next 24 hours.",
  };

  const posts: FeedPost[] = [1, 2, 3].map((offset) => {
    const workout = workouts[workouts.length - offset];
    return {
      id: `post_demo_${offset}`,
      workoutId: workout.id,
      author: DEMO_PROFILE.name,
      handle: DEMO_PROFILE.handle,
      title: workout.title,
      description: postDescriptions[workout.title] ?? "",
      createdAt: workout.finishedAt ?? workout.startedAt,
      likes: offset === 1 ? 12 : offset === 2 ? 8 : 5,
      likedByMe: false,
      comments:
        offset === 1
          ? [
              {
                id: "comment_demo_1",
                author: "Priya Raman",
                handle: "priyalifts",
                content: "That bench volume is no joke. Nice work!",
                createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
              },
            ]
          : [],
    };
  });

  return {
    profile: DEMO_PROFILE,
    exercises: buildSeedExercises(),
    routines,
    folders,
    workouts,
    posts,
    activeWorkout: null,
  };
}
