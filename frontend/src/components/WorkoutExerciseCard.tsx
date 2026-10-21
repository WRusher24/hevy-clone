import { AddIcon, CheckIcon, CloseIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, Button, Textarea } from "@chakra-ui/react";
import { useApp } from "../context/AppContext";
import { WeightUnit, WorkoutExercise } from "../Types";
import { DumbbellIcon } from "./icons";

interface WorkoutExerciseCardProps {
  exercise: WorkoutExercise;
  unit: WeightUnit;
  onStartRest: (seconds: number) => void;
}

export default function WorkoutExerciseCard({
  exercise,
  unit,
  onStartRest,
}: WorkoutExerciseCardProps) {
  const { addSet, updateSet, removeSet, removeActiveExercise, updateActiveExercise } = useApp();

  const handleNumber = (raw: string): number | null => {
    if (raw.trim() === "") return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const completedCount = exercise.sets.filter((set) => set.completed).length;

  return (
    <Box className="workout-exercise">
      <div className="workout-exercise-head">
        <span className="exercise-thumb">
          <DumbbellIcon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="strong truncate" style={{ fontSize: 15 }}>
            {exercise.name}
          </div>
          <div className="small muted">
            {exercise.primaryMuscle} · {completedCount}/{exercise.sets.length} sets done
          </div>
        </div>
        <button
          type="button"
          className="icon-btn"
          title={`Rest ${exercise.restSeconds}s`}
          onClick={() => onStartRest(exercise.restSeconds)}
        >
          <TimeIcon boxSize="12px" />
        </button>
        <button
          type="button"
          className="icon-btn"
          title="Remove exercise"
          onClick={() => removeActiveExercise(exercise.id)}
        >
          <CloseIcon boxSize="10px" />
        </button>
      </div>

      <div style={{ padding: "14px 16px 16px" }}>
        <div className="set-head">
          <span>Set</span>
          <span>{unit.toUpperCase()}</span>
          <span>Reps</span>
          <span>Done</span>
          <span />
        </div>

        <div className="set-table">
          {exercise.sets.map((set, index) => (
            <div className="set-row" key={set.id}>
              <span className={`set-index${set.completed ? " is-done" : ""}`}>{index + 1}</span>

              <input
                className="set-input"
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                placeholder={unit}
                value={set.weight ?? ""}
                onChange={(event) =>
                  updateSet(exercise.id, set.id, { weight: handleNumber(event.target.value) })
                }
              />

              <input
                className="set-input"
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                placeholder="0"
                value={set.reps ?? ""}
                onChange={(event) =>
                  updateSet(exercise.id, set.id, { reps: handleNumber(event.target.value) })
                }
              />

              <button
                type="button"
                className={`icon-btn${set.completed ? " is-on" : ""}`}
                aria-label={set.completed ? "Mark set incomplete" : "Mark set complete"}
                onClick={() => updateSet(exercise.id, set.id, { completed: !set.completed })}
              >
                <CheckIcon boxSize="12px" />
              </button>

              <button
                type="button"
                className="icon-btn"
                aria-label="Remove set"
                onClick={() => removeSet(exercise.id, set.id)}
              >
                <CloseIcon boxSize="9px" />
              </button>
            </div>
          ))}
        </div>

        <Button
          leftIcon={<AddIcon boxSize="10px" />}
          size="xs"
          variant="ghost"
          mt={3}
          width="100%"
          onClick={() => addSet(exercise.id)}
        >
          Add set
        </Button>

        <Textarea
          mt={2}
          size="sm"
          rows={1}
          resize="none"
          minH="28px"
          variant="unstyled"
          fontSize="13px"
          placeholder="Notes for this exercise..."
          value={exercise.notes}
          onChange={(event) => updateActiveExercise(exercise.id, { notes: event.target.value })}
        />
      </div>
    </Box>
  );
}
