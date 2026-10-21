/**
 * Domain types for the workout tracker.
 *
 * Weights are always stored in the user's preferred unit (`Profile.unit`).
 * The unit used for a finished workout is snapshotted on the workout itself so
 * that changing the preference later never rewrites history.
 */

export type WeightUnit = "kg" | "lb";

export type MuscleGroup =
  | "Chest"
  | "Back"
  | "Shoulders"
  | "Biceps"
  | "Triceps"
  | "Forearms"
  | "Quads"
  | "Hamstrings"
  | "Glutes"
  | "Calves"
  | "Abs"
  | "Traps"
  | "Full Body"
  | "Cardio";

export type Equipment =
  | "Barbell"
  | "Dumbbell"
  | "Machine"
  | "Cable"
  | "Bodyweight"
  | "Kettlebell"
  | "Band"
  | "Plate"
  | "Other";

export type ExerciseCategory = "strength" | "cardio" | "stretch";

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  category: ExerciseCategory;
  isCustom?: boolean;
}

export type SetType = "normal" | "warmup" | "dropset" | "failure";

export interface WorkoutSet {
  id: string;
  weight: number | null;
  reps: number | null;
  completed: boolean;
  type: SetType;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  notes: string;
  restSeconds: number;
  sets: WorkoutSet[];
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  startedAt: string;
  finishedAt: string | null;
  routineId: string | null;
  unit: WeightUnit;
  exercises: WorkoutExercise[];
  /** Whether the finished workout is published to the feed. */
  shared: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: string;
  name: string;
  primaryMuscle: MuscleGroup;
  notes: string;
  restSeconds: number;
  sets: number;
  targetRepsMin: number;
  targetRepsMax: number;
}

export interface Routine {
  id: string;
  name: string;
  notes: string;
  folderId: string | null;
  exercises: RoutineExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface RoutineFolder {
  id: string;
  name: string;
}

export interface FeedComment {
  id: string;
  author: string;
  handle: string;
  content: string;
  createdAt: string;
}

export interface FeedPost {
  id: string;
  workoutId: string;
  author: string;
  handle: string;
  title: string;
  description: string;
  createdAt: string;
  likes: number;
  likedByMe: boolean;
  comments: FeedComment[];
}

export interface Profile {
  name: string;
  handle: string;
  bio: string;
  unit: WeightUnit;
  bodyweight: number | null;
  weeklyGoal: number;
}

export interface AppState {
  profile: Profile;
  exercises: Exercise[];
  routines: Routine[];
  folders: RoutineFolder[];
  workouts: Workout[];
  posts: FeedPost[];
  activeWorkout: Workout | null;
}
