import { Equipment, Exercise, ExerciseCategory, MuscleGroup } from "../Types";
import { slugify } from "./id";

type SeedRow = [name: string, muscle: MuscleGroup, equipment: Equipment, category?: ExerciseCategory];

/**
 * Starter exercise library. Ids are slugged from the name so they stay stable
 * across reloads and resets.
 */
const SEED_ROWS: SeedRow[] = [
  // Chest
  ["Barbell Bench Press", "Chest", "Barbell"],
  ["Incline Barbell Bench Press", "Chest", "Barbell"],
  ["Decline Barbell Bench Press", "Chest", "Barbell"],
  ["Dumbbell Bench Press", "Chest", "Dumbbell"],
  ["Incline Dumbbell Press", "Chest", "Dumbbell"],
  ["Dumbbell Fly", "Chest", "Dumbbell"],
  ["Cable Crossover", "Chest", "Cable"],
  ["Machine Chest Press", "Chest", "Machine"],
  ["Pec Deck", "Chest", "Machine"],
  ["Push Up", "Chest", "Bodyweight"],
  ["Chest Dip", "Chest", "Bodyweight"],

  // Back
  ["Deadlift", "Back", "Barbell"],
  ["Barbell Row", "Back", "Barbell"],
  ["Pendlay Row", "Back", "Barbell"],
  ["T-Bar Row", "Back", "Barbell"],
  ["Rack Pull", "Back", "Barbell"],
  ["Seated Cable Row", "Back", "Cable"],
  ["Lat Pulldown", "Back", "Cable"],
  ["Straight Arm Pulldown", "Back", "Cable"],
  ["Pull Up", "Back", "Bodyweight"],
  ["Chin Up", "Back", "Bodyweight"],
  ["Single Arm Dumbbell Row", "Back", "Dumbbell"],
  ["Chest Supported Row", "Back", "Machine"],
  ["Back Extension", "Back", "Bodyweight"],
  ["Band Pull Apart", "Back", "Band"],

  // Shoulders
  ["Overhead Press", "Shoulders", "Barbell"],
  ["Seated Dumbbell Shoulder Press", "Shoulders", "Dumbbell"],
  ["Arnold Press", "Shoulders", "Dumbbell"],
  ["Lateral Raise", "Shoulders", "Dumbbell"],
  ["Cable Lateral Raise", "Shoulders", "Cable"],
  ["Rear Delt Fly", "Shoulders", "Dumbbell"],
  ["Reverse Pec Deck", "Shoulders", "Machine"],
  ["Front Raise", "Shoulders", "Dumbbell"],
  ["Upright Row", "Shoulders", "Barbell"],
  ["Machine Shoulder Press", "Shoulders", "Machine"],
  ["Landmine Press", "Shoulders", "Barbell"],

  // Biceps
  ["Barbell Curl", "Biceps", "Barbell"],
  ["EZ Bar Curl", "Biceps", "Barbell"],
  ["Dumbbell Curl", "Biceps", "Dumbbell"],
  ["Hammer Curl", "Biceps", "Dumbbell"],
  ["Incline Dumbbell Curl", "Biceps", "Dumbbell"],
  ["Concentration Curl", "Biceps", "Dumbbell"],
  ["Preacher Curl", "Biceps", "Machine"],
  ["Cable Curl", "Biceps", "Cable"],
  ["Spider Curl", "Biceps", "Dumbbell"],
  ["21s Biceps Curl", "Biceps", "Dumbbell"],

  // Triceps
  ["Close Grip Bench Press", "Triceps", "Barbell"],
  ["Skull Crusher", "Triceps", "Barbell"],
  ["Triceps Pushdown", "Triceps", "Cable"],
  ["Overhead Cable Extension", "Triceps", "Cable"],
  ["Machine Pressdown", "Triceps", "Machine"],
  ["Dumbbell Overhead Extension", "Triceps", "Dumbbell"],
  ["Triceps Kickback", "Triceps", "Dumbbell"],
  ["Bench Dip", "Triceps", "Bodyweight"],
  ["Diamond Push Up", "Triceps", "Bodyweight"],

  // Forearms
  ["Wrist Curl", "Forearms", "Dumbbell"],
  ["Reverse Wrist Curl", "Forearms", "Dumbbell"],
  ["Reverse Curl", "Forearms", "Barbell"],
  ["Farmer's Carry", "Forearms", "Dumbbell"],

  // Quads
  ["Back Squat", "Quads", "Barbell"],
  ["Front Squat", "Quads", "Barbell"],
  ["Pause Squat", "Quads", "Barbell"],
  ["Hack Squat", "Quads", "Machine"],
  ["Leg Press", "Quads", "Machine"],
  ["Smith Machine Squat", "Quads", "Machine"],
  ["Leg Extension", "Quads", "Machine"],
  ["Bulgarian Split Squat", "Quads", "Dumbbell"],
  ["Walking Lunge", "Quads", "Dumbbell"],
  ["Goblet Squat", "Quads", "Kettlebell"],
  ["Step Up", "Quads", "Dumbbell"],

  // Hamstrings
  ["Romanian Deadlift", "Hamstrings", "Barbell"],
  ["Stiff Leg Deadlift", "Hamstrings", "Barbell"],
  ["Good Morning", "Hamstrings", "Barbell"],
  ["Lying Leg Curl", "Hamstrings", "Machine"],
  ["Seated Leg Curl", "Hamstrings", "Machine"],
  ["Nordic Curl", "Hamstrings", "Bodyweight"],
  ["Single Leg RDL", "Hamstrings", "Dumbbell"],

  // Glutes
  ["Hip Thrust", "Glutes", "Barbell"],
  ["Glute Bridge", "Glutes", "Barbell"],
  ["Sumo Deadlift", "Glutes", "Barbell"],
  ["Cable Kickback", "Glutes", "Cable"],
  ["Hip Abduction Machine", "Glutes", "Machine"],
  ["Banded Lateral Walk", "Glutes", "Band"],

  // Calves
  ["Standing Calf Raise", "Calves", "Machine"],
  ["Seated Calf Raise", "Calves", "Machine"],
  ["Donkey Calf Raise", "Calves", "Machine"],
  ["Single Leg Calf Raise", "Calves", "Bodyweight"],

  // Abs
  ["Crunch", "Abs", "Bodyweight"],
  ["Hanging Leg Raise", "Abs", "Bodyweight"],
  ["Cable Crunch", "Abs", "Cable"],
  ["Plank", "Abs", "Bodyweight"],
  ["Ab Wheel Rollout", "Abs", "Other"],
  ["Russian Twist", "Abs", "Plate"],
  ["Bicycle Crunch", "Abs", "Bodyweight"],
  ["Side Plank", "Abs", "Bodyweight"],

  // Traps
  ["Barbell Shrug", "Traps", "Barbell"],
  ["Dumbbell Shrug", "Traps", "Dumbbell"],
  ["Cable Shrug", "Traps", "Cable"],

  // Full body / Olympic
  ["Power Clean", "Full Body", "Barbell"],
  ["Clean and Jerk", "Full Body", "Barbell"],
  ["Snatch", "Full Body", "Barbell"],
  ["Thruster", "Full Body", "Barbell"],
  ["Kettlebell Swing", "Full Body", "Kettlebell"],
  ["Turkish Get Up", "Full Body", "Kettlebell"],
  ["Burpee", "Full Body", "Bodyweight"],

  // Cardio
  ["Treadmill Run", "Cardio", "Machine", "cardio"],
  ["Incline Walk", "Cardio", "Machine", "cardio"],
  ["Rowing Machine", "Cardio", "Machine", "cardio"],
  ["Stationary Bike", "Cardio", "Machine", "cardio"],
  ["Stair Climber", "Cardio", "Machine", "cardio"],
  ["Jump Rope", "Cardio", "Other", "cardio"],
  ["Elliptical", "Cardio", "Machine", "cardio"],
];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest",
  "Back",
  "Shoulders",
  "Biceps",
  "Triceps",
  "Forearms",
  "Quads",
  "Hamstrings",
  "Glutes",
  "Calves",
  "Abs",
  "Traps",
  "Full Body",
  "Cardio",
];

export const EQUIPMENT_OPTIONS: Equipment[] = [
  "Barbell",
  "Dumbbell",
  "Machine",
  "Cable",
  "Bodyweight",
  "Kettlebell",
  "Band",
  "Plate",
  "Other",
];

export function buildSeedExercises(): Exercise[] {
  return SEED_ROWS.map(([name, primaryMuscle, equipment, category]) => ({
    id: slugify(name),
    name,
    primaryMuscle,
    secondaryMuscles: [],
    equipment,
    category: category ?? "strength",
    isCustom: false,
  }));
}
