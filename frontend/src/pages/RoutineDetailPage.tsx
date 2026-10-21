import { DeleteIcon, EditIcon, LinkIcon, RepeatIcon } from "@chakra-ui/icons";
import { Button, Divider, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { absoluteUrl, copyToClipboard } from "../lib/clipboard";
import { formatDate } from "../lib/format";
import { finishedWorkouts } from "../lib/stats";

export default function RoutineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getRoutine,
    folders,
    workouts,
    activeWorkout,
    deleteRoutine,
    duplicateRoutine,
    startWorkoutFromRoutine,
    discardWorkout,
  } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStart, setConfirmStart] = useState(false);

  const routine = id ? getRoutine(id) : undefined;
  const folder = routine?.folderId
    ? folders.find((item) => item.id === routine.folderId)
    : undefined;

  if (!routine) {
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

  const lastPerformed = finishedWorkouts(workouts).find(
    (workout) => workout.routineId === routine.id
  );

  const handleStart = () => {
    if (activeWorkout) {
      setConfirmStart(true);
      return;
    }
    startWorkoutFromRoutine(routine.id);
    navigate("/workout");
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(absoluteUrl(`/routines/${routine.id}`));
    toast({
      title: ok ? "Routine link copied" : "Could not copy link",
      status: ok ? "success" : "error",
      duration: 1800,
      isClosable: true,
    });
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">{routine.name}</h1>
          <p className="page-subtitle">
            {routine.exercises.length} exercises
            {folder ? ` · ${folder.name}` : ""}
            {lastPerformed ? ` · last performed ${formatDate(lastPerformed.startedAt)}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button
            size="sm"
            leftIcon={<RepeatIcon />}
            onClick={handleStart}
          >
            Start workout
          </Button>
          <Button size="sm" variant="ghost" as={Link} to={`/routines/${routine.id}/edit`} leftIcon={<EditIcon />}>
            Edit
          </Button>
          <Button size="sm" variant="ghost" leftIcon={<LinkIcon />} onClick={handleCopy}>
            Copy link
          </Button>
          <Button
            size="sm"
            variant="ghost"
            color="red.300"
            leftIcon={<DeleteIcon />}
            onClick={() => setConfirmDelete(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {routine.notes ? (
        <Text className="small muted" mb={4}>
          {routine.notes}
        </Text>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {routine.exercises.map((exercise, index) => (
          <div className="workout-exercise" key={exercise.id}>
            <div className="workout-exercise-head">
              <span className="set-index">{index + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="strong truncate" style={{ fontSize: 15 }}>
                  {exercise.name}
                </div>
                <div className="small muted">{exercise.primaryMuscle}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <span className="chip">{exercise.sets} sets</span>
                <span className="chip">
                  {exercise.targetRepsMin}-{exercise.targetRepsMax} reps
                </span>
                {exercise.restSeconds > 0 ? (
                  <span className="chip">Rest {exercise.restSeconds}s</span>
                ) : null}
              </div>
            </div>
            {exercise.notes ? (
              <Text className="small muted" style={{ padding: "10px 16px 14px" }} fontStyle="italic">
                “{exercise.notes}”
              </Text>
            ) : null}
          </div>
        ))}

        {routine.exercises.length === 0 ? (
          <div className="card">
            <EmptyState
              title="This routine is empty"
              description="Add exercises to make it usable."
              action={
                <Button size="sm" as={Link} to={`/routines/${routine.id}/edit`}>
                  Edit routine
                </Button>
              }
            />
          </div>
        ) : null}
      </div>

      <Divider my={5} />

      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" variant="ghost" as={Link} to="/routines">
          Back to routines
        </Button>
        <Button size="sm" variant="ghost" onClick={() => duplicateRoutine(routine.id)}>
          Duplicate routine
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete this routine?"
        body="Workouts already logged from this routine stay in your history."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteRoutine(routine.id);
          navigate("/routines");
        }}
        onClose={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        isOpen={confirmStart}
        title="A workout is already in progress"
        body="Starting this routine will discard the workout you are currently logging."
        confirmLabel="Discard and start"
        danger
        onConfirm={() => {
          discardWorkout();
          startWorkoutFromRoutine(routine.id);
          navigate("/workout");
        }}
        onClose={() => setConfirmStart(false)}
      />
    </div>
  );
}
