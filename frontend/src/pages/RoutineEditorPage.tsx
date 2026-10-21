import { AddIcon, ArrowDownIcon, ArrowUpIcon, CloseIcon } from "@chakra-ui/icons";
import { Button, Input, Select, Text, Textarea } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import ExercisePicker from "../components/ExercisePicker";
import { useApp } from "../context/AppContext";
import { uid } from "../lib/id";
import { Exercise, RoutineExercise } from "../Types";
import { DumbbellIcon } from "../components/icons";

function toRoutineExercise(exercise: Exercise): RoutineExercise {
  return {
    id: uid("re"),
    exerciseId: exercise.id,
    name: exercise.name,
    primaryMuscle: exercise.primaryMuscle,
    notes: "",
    restSeconds: 90,
    sets: 3,
    targetRepsMin: 8,
    targetRepsMax: 12,
  };
}

export default function RoutineEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { getRoutine, createRoutine, updateRoutine, folders } = useApp();
  const navigate = useNavigate();

  const existing = id ? getRoutine(id) : undefined;
  const isEdit = Boolean(id);

  const [name, setName] = useState(existing?.name ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [folderId, setFolderId] = useState<string | null>(existing?.folderId ?? null);
  const [exercises, setExercises] = useState<RoutineExercise[]>(existing?.exercises ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);

  if (isEdit && !existing) {
    return (
      <div className="page page-narrow">
        <div className="card">
          <EmptyState
            title="Routine not found"
            description="It may have been deleted."
            action={
              <Button size="sm" as={Link} to="/routines">
                Back to routines
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const updateExercise = (exerciseId: string, patch: Partial<RoutineExercise>) => {
    setExercises((current) =>
      current.map((exercise) =>
        exercise.id === exerciseId ? { ...exercise, ...patch } : exercise
      )
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    setExercises((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const copy = [...current];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });
  };

  const handleSave = () => {
    const payload = {
      name: name.trim() || "Untitled Routine",
      notes,
      folderId,
      exercises,
    };

    if (isEdit && existing) {
      updateRoutine(existing.id, payload);
      navigate(`/routines/${existing.id}`);
      return;
    }

    const created = createRoutine(payload);
    navigate(`/routines/${created.id}`);
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">{isEdit ? "Edit routine" : "New routine"}</h1>
          <p className="page-subtitle">
            Set target sets, rep ranges and rest so you can start training in one tap.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="ghost" as={Link} to={isEdit && existing ? `/routines/${existing.id}` : "/routines"}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            {isEdit ? "Save changes" : "Create routine"}
          </Button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <Input
          variant="unstyled"
          fontSize="22px"
          fontWeight="800"
          placeholder="Routine name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          mb={2}
        />
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          <Select
            size="sm"
            value={folderId ?? ""}
            onChange={(event) => setFolderId(event.target.value || null)}
          >
            <option value="">No folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </Select>
          <Textarea
            size="sm"
            rows={1}
            placeholder="Routine notes (optional)"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {exercises.map((exercise, index) => (
          <div className="card card-pad" key={exercise.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="exercise-thumb">
                <DumbbellIcon size={18} />
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="strong truncate" style={{ fontSize: 15 }}>
                  {exercise.name}
                </div>
                <div className="small muted">{exercise.primaryMuscle}</div>
              </div>
              <button
                type="button"
                className="icon-btn"
                aria-label="Move up"
                onClick={() => move(index, -1)}
                disabled={index === 0}
              >
                <ArrowUpIcon boxSize="10px" />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Move down"
                onClick={() => move(index, 1)}
                disabled={index === exercises.length - 1}
              >
                <ArrowDownIcon boxSize="10px" />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label="Remove exercise"
                onClick={() =>
                  setExercises((current) => current.filter((item) => item.id !== exercise.id))
                }
              >
                <CloseIcon boxSize="10px" />
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gap: 10,
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                marginTop: 12,
              }}
            >
              <div>
                <Text className="small muted" mb={1}>
                  Sets
                </Text>
                <Input
                  size="sm"
                  type="number"
                  min={1}
                  value={exercise.sets}
                  onChange={(event) =>
                    updateExercise(exercise.id, {
                      sets: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </div>
              <div>
                <Text className="small muted" mb={1}>
                  Min reps
                </Text>
                <Input
                  size="sm"
                  type="number"
                  min={1}
                  value={exercise.targetRepsMin}
                  onChange={(event) =>
                    updateExercise(exercise.id, {
                      targetRepsMin: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </div>
              <div>
                <Text className="small muted" mb={1}>
                  Max reps
                </Text>
                <Input
                  size="sm"
                  type="number"
                  min={1}
                  value={exercise.targetRepsMax}
                  onChange={(event) =>
                    updateExercise(exercise.id, {
                      targetRepsMax: Math.max(1, Number(event.target.value) || 1),
                    })
                  }
                />
              </div>
              <div>
                <Text className="small muted" mb={1}>
                  Rest (s)
                </Text>
                <Input
                  size="sm"
                  type="number"
                  min={0}
                  step={15}
                  value={exercise.restSeconds}
                  onChange={(event) =>
                    updateExercise(exercise.id, {
                      restSeconds: Math.max(0, Number(event.target.value) || 0),
                    })
                  }
                />
              </div>
            </div>

            <Textarea
              mt={2}
              size="sm"
              rows={1}
              variant="unstyled"
              fontSize="13px"
              placeholder="Notes for this exercise..."
              value={exercise.notes}
              onChange={(event) => updateExercise(exercise.id, { notes: event.target.value })}
            />
          </div>
        ))}

        {exercises.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No exercises yet"
              description="Add exercises from the library to build this routine."
              action={
                <Button size="sm" onClick={() => setPickerOpen(true)}>
                  Add exercise
                </Button>
              }
            />
          </div>
        ) : null}

        <Button
          variant="outline"
          borderStyle="dashed"
          borderColor="surface.500"
          leftIcon={<AddIcon boxSize="10px" />}
          onClick={() => setPickerOpen(true)}
        >
          Add exercise
        </Button>
      </div>

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(exercise) =>
          setExercises((current) => [...current, toRoutineExercise(exercise)])
        }
        title="Add to routine"
      />
    </div>
  );
}
