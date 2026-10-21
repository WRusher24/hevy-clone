import { AddIcon, CheckIcon, TimeIcon } from "@chakra-ui/icons";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import ExercisePicker from "../components/ExercisePicker";
import RestTimer from "../components/RestTimer";
import WorkoutExerciseCard from "../components/WorkoutExerciseCard";
import { useApp } from "../context/AppContext";
import {
  formatDate,
  formatDuration,
  formatStopwatch,
  formatVolume,
  parseDate,
} from "../lib/format";
import { summarizeWorkout } from "../lib/stats";

export default function ActiveWorkoutPage() {
  const {
    activeWorkout,
    routines,
    workouts,
    profile,
    startEmptyWorkout,
    startWorkoutFromRoutine,
    repeatWorkout,
    addExerciseToActive,
    updateActiveWorkout,
    finishWorkout,
    discardWorkout,
  } = useApp();
  const navigate = useNavigate();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [share, setShare] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState<{ endsAt: number; total: number } | null>(null);

  const startedAt = activeWorkout?.startedAt;

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const tick = () => setElapsed(Date.now() - parseDate(startedAt).getTime());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt]);

  const startRest = (seconds: number) => {
    setRest({ endsAt: Date.now() + seconds * 1000, total: seconds });
  };

  if (!activeWorkout) {
    const recent = workouts
      .filter((workout) => workout.finishedAt)
      .slice(0, 3);

    return (
      <div className="page page-narrow">
        <div className="page-header">
          <div>
            <h1 className="page-title">Start a workout</h1>
            <p className="page-subtitle">Log an empty session, follow a routine, or repeat history.</p>
          </div>
        </div>

        <div className="card card-pad" style={{ marginBottom: 16 }}>
          <Button
            width="100%"
            size="md"
            leftIcon={<AddIcon boxSize="11px" />}
            onClick={() => startEmptyWorkout()}
          >
            Start empty workout
          </Button>
          <Text className="small muted" mt={2}>
            Add exercises as you go. Everything is saved automatically.
          </Text>
        </div>

        <div className="split-2">
          <div className="card">
            <div className="list-row">
              <span className="section-title" style={{ flex: 1 }}>
                From a routine
              </span>
              <Link to="/routines" className="small" style={{ color: "var(--accent)" }}>
                Manage
              </Link>
            </div>
            {routines.length === 0 ? (
              <EmptyState
                title="No routines yet"
                description="Create a routine to start training in one tap."
                action={
                  <Button size="sm" as={Link} to="/routines/new">
                    Create routine
                  </Button>
                }
              />
            ) : (
              routines.map((routine) => (
                <button
                  type="button"
                  className="list-row"
                  key={routine.id}
                  onClick={() => startWorkoutFromRoutine(routine.id)}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="strong truncate" style={{ display: "block", fontSize: 14 }}>
                      {routine.name}
                    </span>
                    <span className="small muted">{routine.exercises.length} exercises</span>
                  </span>
                  <span className="chip chip-accent">Start</span>
                </button>
              ))
            )}
          </div>

          <div className="card">
            <div className="list-row">
              <span className="section-title" style={{ flex: 1 }}>
                Repeat a recent workout
              </span>
              <Link to="/history" className="small" style={{ color: "var(--accent)" }}>
                History
              </Link>
            </div>
            {recent.length === 0 ? (
              <div className="small muted" style={{ padding: "0 16px 16px" }}>
                Your finished workouts will show up here.
              </div>
            ) : (
              recent.map((workout) => (
                <button
                  type="button"
                  className="list-row"
                  key={workout.id}
                  onClick={() => repeatWorkout(workout.id)}
                >
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="strong truncate" style={{ display: "block", fontSize: 14 }}>
                      {workout.title}
                    </span>
                    <span className="small muted">
                      {formatDate(workout.startedAt)} · {workout.exercises.length} exercises
                    </span>
                  </span>
                  <span className="chip">Repeat</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  const summary = summarizeWorkout(activeWorkout);
  const completedSets = activeWorkout.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.filter((set) => set.completed).length,
    0
  );

  const handleFinish = () => {
    const finished = finishWorkout(share && summary.exerciseCount > 0);
    setFinishOpen(false);
    if (finished) navigate(`/workout/${finished.id}`);
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div style={{ flex: 1, minWidth: 220 }}>
          <Input
            variant="unstyled"
            fontSize="24px"
            fontWeight="800"
            letterSpacing="-0.02em"
            value={activeWorkout.title}
            onChange={(event) => updateActiveWorkout({ title: event.target.value })}
            placeholder="Workout title"
            aria-label="Workout title"
          />
          <div className="small muted" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <TimeIcon boxSize="10px" /> {formatStopwatch(elapsed)}
            </span>
            <span>·</span>
            <span>{formatVolume(summary.volume, activeWorkout.unit)}</span>
            <span>·</span>
            <span>{completedSets} set{completedSets === 1 ? "" : "s"} done</span>
            <span>·</span>
            <span>{formatDate(activeWorkout.startedAt)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => setConfirmDiscard(true)}>
            Discard
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<CheckIcon boxSize="10px" />}
            onClick={() => setFinishOpen(true)}
          >
            Finish
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {activeWorkout.exercises.map((exercise) => (
          <WorkoutExerciseCard
            key={exercise.id}
            exercise={exercise}
            unit={activeWorkout.unit}
            onStartRest={startRest}
          />
        ))}

        {activeWorkout.exercises.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No exercises yet"
              description="Add your first exercise to start logging sets."
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
          leftIcon={<AddIcon boxSize="10px" />}
          onClick={() => setPickerOpen(true)}
          borderStyle="dashed"
          borderColor="surface.500"
        >
          Add exercise
        </Button>

        <div className="card card-pad">
          <Text className="section-title" mb={2}>
            Workout notes
          </Text>
          <Textarea
            size="sm"
            rows={2}
            variant="unstyled"
            placeholder="How did it feel? Anything to remember for next time?"
            value={activeWorkout.description}
            onChange={(event) => updateActiveWorkout({ description: event.target.value })}
          />
        </div>
      </div>

      {rest ? (
        <RestTimer
          endsAt={rest.endsAt}
          totalSeconds={rest.total}
          onExtend={(seconds) =>
            setRest((current) =>
              current
                ? { endsAt: current.endsAt + seconds * 1000, total: current.total + seconds }
                : current
            )
          }
          onDismiss={() => setRest(null)}
        />
      ) : null}

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(exercise) => addExerciseToActive(exercise.id)}
      />

      <Modal isOpen={finishOpen} onClose={() => setFinishOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Finish workout</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <div className="stat-grid" style={{ marginBottom: 14 }}>
              <div className="stat-tile">
                <div className="stat-label">Duration</div>
                <div className="stat-value">{formatDuration(summary.durationMs)}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-label">Volume</div>
                <div className="stat-value">{formatVolume(summary.volume, activeWorkout.unit)}</div>
              </div>
              <div className="stat-tile">
                <div className="stat-label">Sets</div>
                <div className="stat-value">{summary.sets}</div>
              </div>
            </div>
            <Checkbox
              isChecked={share && summary.exerciseCount > 0}
              isDisabled={summary.exerciseCount === 0}
              onChange={(event) => setShare(event.target.checked)}
            >
              Share to feed as @{profile.handle}
            </Checkbox>
            <Text className="small muted" mt={2}>
              {summary.exerciseCount === 0
                ? "This workout has no exercises. It will still be saved to your history."
                : `${summary.exerciseCount} exercises will be saved to your history.`}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" size="sm" mr={2} onClick={() => setFinishOpen(false)}>
              Keep training
            </Button>
            <Button colorScheme="green" size="sm" onClick={handleFinish}>
              Save workout
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        isOpen={confirmDiscard}
        title="Discard this workout?"
        body="All sets logged in this session will be lost. This cannot be undone."
        confirmLabel="Discard"
        danger
        onConfirm={() => {
          discardWorkout();
          navigate("/");
        }}
        onClose={() => setConfirmDiscard(false)}
      />
    </div>
  );
}
