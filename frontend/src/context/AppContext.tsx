import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  AppState,
  Exercise,
  ExerciseCategory,
  Equipment,
  FeedPost,
  MuscleGroup,
  Profile,
  Routine,
  RoutineExercise,
  RoutineFolder,
  SetType,
  WeightUnit,
  Workout,
  WorkoutExercise,
  WorkoutSet,
} from "../Types";
import { uid } from "../lib/id";
import { freshState, loadState, saveState } from "../lib/storage";

export interface RoutineInput {
  name: string;
  notes: string;
  folderId: string | null;
  exercises: RoutineExercise[];
}

export interface NewExerciseInput {
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  category?: ExerciseCategory;
}

interface AppContextValue {
  profile: Profile;
  exercises: Exercise[];
  routines: Routine[];
  folders: RoutineFolder[];
  workouts: Workout[];
  posts: FeedPost[];
  activeWorkout: Workout | null;

  getExercise: (id: string) => Exercise | undefined;
  getWorkout: (id: string) => Workout | undefined;
  getRoutine: (id: string) => Routine | undefined;

  updateProfile: (patch: Partial<Profile>) => void;

  createExercise: (input: NewExerciseInput) => Exercise;
  deleteExercise: (id: string) => void;

  createRoutine: (input: RoutineInput) => Routine;
  updateRoutine: (id: string, input: RoutineInput) => void;
  deleteRoutine: (id: string) => void;
  duplicateRoutine: (id: string) => Routine | null;
  moveRoutine: (id: string, folderId: string | null) => void;
  createFolder: (name: string) => RoutineFolder;
  renameFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;

  startEmptyWorkout: () => void;
  startWorkoutFromRoutine: (routineId: string) => void;
  repeatWorkout: (workoutId: string) => void;
  addExerciseToActive: (exerciseId: string) => void;
  removeActiveExercise: (workoutExerciseId: string) => void;
  addSet: (workoutExerciseId: string) => void;
  updateSet: (
    workoutExerciseId: string,
    setId: string,
    patch: Partial<Pick<WorkoutSet, "weight" | "reps" | "completed" | "type">>
  ) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  updateActiveExercise: (
    workoutExerciseId: string,
    patch: Partial<Pick<WorkoutExercise, "notes" | "restSeconds">>
  ) => void;
  updateActiveWorkout: (patch: Partial<Pick<Workout, "title" | "description">>) => void;
  finishWorkout: (share: boolean) => Workout | null;
  discardWorkout: () => void;

  deleteWorkout: (id: string) => void;
  shareWorkout: (id: string) => void;
  unshareWorkout: (id: string) => void;

  toggleLike: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  deletePost: (postId: string) => void;

  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

function emptySet(type: SetType = "normal"): WorkoutSet {
  return { id: uid("set"), weight: null, reps: null, completed: false, type };
}

function buildWorkoutExercise(exercise: Exercise, unit: WeightUnit, sets = 3): WorkoutExercise {
  return {
    id: uid("we"),
    exerciseId: exercise.id,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    notes: "",
    restSeconds: 90,
    sets: Array.from({ length: sets }).map(() => emptySet()),
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => loadState());
  const hydrated = useRef(false);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    saveState(state);
  }, [state]);

  const getExercise = (id: string) => state.exercises.find((exercise) => exercise.id === id);
  const getWorkout = (id: string) => state.workouts.find((workout) => workout.id === id);
  const getRoutine = (id: string) => state.routines.find((routine) => routine.id === id);

  const updateProfile = (patch: Partial<Profile>) => {
    setState((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  };

  const createExercise = (input: NewExerciseInput): Exercise => {
    const exercise: Exercise = {
      id: uid("ex"),
      name: input.name.trim(),
      primaryMuscle: input.primaryMuscle,
      secondaryMuscles: input.secondaryMuscles ?? [],
      equipment: input.equipment,
      category: input.category ?? "strength",
      isCustom: true,
    };
    setState((prev) => ({ ...prev, exercises: [exercise, ...prev.exercises] }));
    return exercise;
  };

  const deleteExercise = (id: string) => {
    setState((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((exercise) => exercise.id !== id || !exercise.isCustom),
    }));
  };

  const createRoutine = (input: RoutineInput): Routine => {
    const now = new Date().toISOString();
    const routine: Routine = {
      id: uid("routine"),
      name: input.name.trim() || "Untitled Routine",
      notes: input.notes,
      folderId: input.folderId,
      exercises: input.exercises,
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, routines: [routine, ...prev.routines] }));
    return routine;
  };

  const updateRoutine = (id: string, input: RoutineInput) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.map((routine) =>
        routine.id === id
          ? {
              ...routine,
              name: input.name.trim() || routine.name,
              notes: input.notes,
              folderId: input.folderId,
              exercises: input.exercises,
              updatedAt: new Date().toISOString(),
            }
          : routine
      ),
    }));
  };

  const deleteRoutine = (id: string) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.filter((routine) => routine.id !== id),
    }));
  };

  const duplicateRoutine = (id: string): Routine | null => {
    const source = state.routines.find((routine) => routine.id === id);
    if (!source) return null;

    const now = new Date().toISOString();
    const copy: Routine = {
      ...source,
      id: uid("routine"),
      name: `${source.name} (Copy)`,
      exercises: source.exercises.map((exercise) => ({ ...exercise, id: uid("re") })),
      createdAt: now,
      updatedAt: now,
    };
    setState((prev) => ({ ...prev, routines: [copy, ...prev.routines] }));
    return copy;
  };

  const moveRoutine = (id: string, folderId: string | null) => {
    setState((prev) => ({
      ...prev,
      routines: prev.routines.map((routine) =>
        routine.id === id ? { ...routine, folderId, updatedAt: new Date().toISOString() } : routine
      ),
    }));
  };

  const createFolder = (name: string): RoutineFolder => {
    const folder: RoutineFolder = { id: uid("folder"), name: name.trim() || "New Folder" };
    setState((prev) => ({ ...prev, folders: [...prev.folders, folder] }));
    return folder;
  };

  const renameFolder = (id: string, name: string) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.map((folder) =>
        folder.id === id ? { ...folder, name: name.trim() || folder.name } : folder
      ),
    }));
  };

  const deleteFolder = (id: string) => {
    setState((prev) => ({
      ...prev,
      folders: prev.folders.filter((folder) => folder.id !== id),
      routines: prev.routines.map((routine) =>
        routine.folderId === id ? { ...routine, folderId: null } : routine
      ),
    }));
  };

  const startEmptyWorkout = () => {
    const workout: Workout = {
      id: uid("workout"),
      title: "Workout",
      description: "",
      startedAt: new Date().toISOString(),
      finishedAt: null,
      routineId: null,
      unit: state.profile.unit,
      exercises: [],
      shared: false,
    };
    setState((prev) => ({ ...prev, activeWorkout: workout }));
  };

  const startWorkoutFromRoutine = (routineId: string) => {
    const routine = state.routines.find((item) => item.id === routineId);
    if (!routine) return;

    const workout: Workout = {
      id: uid("workout"),
      title: routine.name,
      description: routine.notes,
      startedAt: new Date().toISOString(),
      finishedAt: null,
      routineId: routine.id,
      unit: state.profile.unit,
      exercises: routine.exercises.map((routineExercise) => ({
        id: uid("we"),
        exerciseId: routineExercise.exerciseId,
        name: routineExercise.name,
        primaryMuscle: routineExercise.primaryMuscle,
        notes: routineExercise.notes,
        restSeconds: routineExercise.restSeconds,
        sets: Array.from({ length: routineExercise.sets }).map(() => ({
          ...emptySet(),
          reps: routineExercise.targetRepsMax,
        })),
      })),
      shared: false,
    };

    setState((prev) => ({ ...prev, activeWorkout: workout }));
  };

  const repeatWorkout = (workoutId: string) => {
    const source = state.workouts.find((workout) => workout.id === workoutId);
    if (!source) return;

    const clone: Workout = {
      ...source,
      id: uid("workout"),
      startedAt: new Date().toISOString(),
      finishedAt: null,
      shared: false,
      unit: state.profile.unit,
      exercises: source.exercises.map((exercise) => ({
        ...exercise,
        id: uid("we"),
        sets: exercise.sets.map((set) => ({ ...set, id: uid("set"), completed: false })),
      })),
    };

    setState((prev) => ({ ...prev, activeWorkout: clone }));
  };

  const mutateActive = (mutator: (workout: Workout) => Workout) => {
    setState((prev) => (prev.activeWorkout ? { ...prev, activeWorkout: mutator(prev.activeWorkout) } : prev));
  };

  const addExerciseToActive = (exerciseId: string) => {
    const exercise = state.exercises.find((item) => item.id === exerciseId);
    if (!exercise) return;
    mutateActive((workout) => ({
      ...workout,
      exercises: [...workout.exercises, buildWorkoutExercise(exercise, workout.unit)],
    }));
  };

  const removeActiveExercise = (workoutExerciseId: string) => {
    mutateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.filter((exercise) => exercise.id !== workoutExerciseId),
    }));
  };

  const addSet = (workoutExerciseId: string) => {
    mutateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) => {
        if (exercise.id !== workoutExerciseId) return exercise;
        const last = exercise.sets[exercise.sets.length - 1];
        const next: WorkoutSet = last
          ? { ...last, id: uid("set"), completed: false }
          : emptySet();
        return { ...exercise, sets: [...exercise.sets, next] };
      }),
    }));
  };

  const updateSet: AppContextValue["updateSet"] = (workoutExerciseId, setId, patch) => {
    mutateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map((set) => (set.id === setId ? { ...set, ...patch } : set)),
            }
          : exercise
      ),
    }));
  };

  const removeSet = (workoutExerciseId: string, setId: string) => {
    mutateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === workoutExerciseId
          ? { ...exercise, sets: exercise.sets.filter((set) => set.id !== setId) }
          : exercise
      ),
    }));
  };

  const updateActiveExercise: AppContextValue["updateActiveExercise"] = (
    workoutExerciseId,
    patch
  ) => {
    mutateActive((workout) => ({
      ...workout,
      exercises: workout.exercises.map((exercise) =>
        exercise.id === workoutExerciseId ? { ...exercise, ...patch } : exercise
      ),
    }));
  };

  const updateActiveWorkout: AppContextValue["updateActiveWorkout"] = (patch) => {
    mutateActive((workout) => ({ ...workout, ...patch }));
  };

  const finishWorkout = (share: boolean): Workout | null => {
    const active = state.activeWorkout;
    if (!active) return null;

    const finished: Workout = {
      ...active,
      finishedAt: new Date().toISOString(),
      shared: share,
      exercises: active.exercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets.map((set) => ({ ...set, completed: true })),
      })),
    };

    const post: FeedPost | null = share
      ? {
          id: uid("post"),
          workoutId: finished.id,
          author: state.profile.name,
          handle: state.profile.handle,
          title: finished.title,
          description: finished.description,
          createdAt: finished.finishedAt ?? finished.startedAt,
          likes: 0,
          likedByMe: false,
          comments: [],
        }
      : null;

    setState((prev) => ({
      ...prev,
      workouts: [finished, ...prev.workouts],
      posts: post ? [post, ...prev.posts] : prev.posts,
      activeWorkout: null,
    }));

    return finished;
  };

  const discardWorkout = () => {
    setState((prev) => ({ ...prev, activeWorkout: null }));
  };

  const deleteWorkout = (id: string) => {
    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.filter((workout) => workout.id !== id),
      posts: prev.posts.filter((post) => post.workoutId !== id),
    }));
  };

  const shareWorkout = (id: string) => {
    setState((prev) => {
      const workout = prev.workouts.find((item) => item.id === id);
      if (!workout) return prev;
      if (prev.posts.some((post) => post.workoutId === id)) return prev;

      const post: FeedPost = {
        id: uid("post"),
        workoutId: workout.id,
        author: prev.profile.name,
        handle: prev.profile.handle,
        title: workout.title,
        description: workout.description,
        createdAt: workout.finishedAt ?? workout.startedAt,
        likes: 0,
        likedByMe: false,
        comments: [],
      };

      return {
        ...prev,
        workouts: prev.workouts.map((item) => (item.id === id ? { ...item, shared: true } : item)),
        posts: [post, ...prev.posts],
      };
    });
  };

  const unshareWorkout = (id: string) => {
    setState((prev) => ({
      ...prev,
      workouts: prev.workouts.map((item) => (item.id === id ? { ...item, shared: false } : item)),
      posts: prev.posts.filter((post) => post.workoutId !== id),
    }));
  };

  const toggleLike = (postId: string) => {
    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likedByMe: !post.likedByMe,
              likes: post.likes + (post.likedByMe ? -1 : 1),
            }
          : post
      ),
    }));
  };

  const addComment = (postId: string, content: string) => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setState((prev) => ({
      ...prev,
      posts: prev.posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...post.comments,
                {
                  id: uid("comment"),
                  author: prev.profile.name,
                  handle: prev.profile.handle,
                  content: trimmed,
                  createdAt: new Date().toISOString(),
                },
              ],
            }
          : post
      ),
    }));
  };

  const deletePost = (postId: string) => {
    setState((prev) => {
      const post = prev.posts.find((item) => item.id === postId);
      return {
        ...prev,
        posts: prev.posts.filter((item) => item.id !== postId),
        workouts: post
          ? prev.workouts.map((workout) =>
              workout.id === post.workoutId ? { ...workout, shared: false } : workout
            )
          : prev.workouts,
      };
    });
  };

  const resetAll = () => {
    const next = freshState();
    setState(next);
    saveState(next);
  };

  const value: AppContextValue = {
    profile: state.profile,
    exercises: state.exercises,
    routines: state.routines,
    folders: state.folders,
    workouts: state.workouts,
    posts: state.posts,
    activeWorkout: state.activeWorkout,
    getExercise,
    getWorkout,
    getRoutine,
    updateProfile,
    createExercise,
    deleteExercise,
    createRoutine,
    updateRoutine,
    deleteRoutine,
    duplicateRoutine,
    moveRoutine,
    createFolder,
    renameFolder,
    deleteFolder,
    startEmptyWorkout,
    startWorkoutFromRoutine,
    repeatWorkout,
    addExerciseToActive,
    removeActiveExercise,
    addSet,
    updateSet,
    removeSet,
    updateActiveExercise,
    updateActiveWorkout,
    finishWorkout,
    discardWorkout,
    deleteWorkout,
    shareWorkout,
    unshareWorkout,
    toggleLike,
    addComment,
    deletePost,
    resetAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
