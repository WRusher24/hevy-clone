import { DeleteIcon, LinkIcon, RepeatIcon, StarIcon } from "@chakra-ui/icons";
import { Button, Divider, Text, useToast } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import StatTile from "../components/StatTile";
import { useApp } from "../context/AppContext";
import { absoluteUrl, copyToClipboard } from "../lib/clipboard";
import { formatDate, formatDuration, formatVolume, formatWeight, initials } from "../lib/format";
import { personalRecords, summarizeWorkout } from "../lib/stats";
import { DumbbellIcon } from "../components/icons";

export default function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const {
    getWorkout,
    workouts,
    posts,
    deleteWorkout,
    shareWorkout,
    unshareWorkout,
    repeatWorkout,
    discardWorkout,
    profile,
    activeWorkout,
  } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRepeat, setConfirmRepeat] = useState(false);

  const workout = id ? getWorkout(id) : undefined;
  const summary = workout ? summarizeWorkout(workout) : null;
  const post = workout ? posts.find((item) => item.workoutId === workout.id) : undefined;

  const records = useMemo(() => {
    const map = new Map(personalRecords(workouts).map((record) => [record.exerciseId, record]));
    return map;
  }, [workouts]);

  if (!workout) {
    return (
      <div className="page page-narrow">
        <div className="card">
          <EmptyState
            title="Workout not found"
            description="It may have been deleted, or the link is incomplete."
            action={
              <Button size="sm" as={Link} to="/history">
                Back to history
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  if (!workout.finishedAt) {
    return (
      <div className="page page-narrow">
        <div className="card">
          <EmptyState
            title="This workout is still in progress"
            description="Finish it to see the full summary."
            action={
              <Button size="sm" as={Link} to="/workout">
                Resume workout
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const handleRepeat = () => {
    if (activeWorkout) {
      setConfirmRepeat(true);
      return;
    }
    repeatWorkout(workout.id);
    navigate("/workout");
  };

  const handleCopy = async () => {
    const ok = await copyToClipboard(absoluteUrl(`/workout/${workout.id}`));
    toast({
      title: ok ? "Link copied" : "Could not copy link",
      status: ok ? "success" : "error",
      duration: 1800,
      isClosable: true,
    });
  };

  const handleShareToggle = () => {
    if (post) {
      unshareWorkout(workout.id);
      toast({ title: "Removed from feed", status: "info", duration: 1500 });
    } else {
      shareWorkout(workout.id);
      toast({ title: "Shared to feed", status: "success", duration: 1500 });
    }
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div className="avatar-initials">{initials(profile.name)}</div>
          <div>
            <h1 className="page-title">{workout.title}</h1>
            <p className="page-subtitle">
              {formatDate(workout.startedAt)} · @{profile.handle}
              {workout.shared ? " · shared" : ""}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Button size="sm" variant="ghost" leftIcon={<RepeatIcon />} onClick={handleRepeat}>
            Repeat
          </Button>
          <Button size="sm" variant="ghost" leftIcon={<LinkIcon />} onClick={handleCopy}>
            Copy link
          </Button>
          <Button
            size="sm"
            variant="ghost"
            leftIcon={<StarIcon />}
            color={post ? "yellow.300" : undefined}
            onClick={handleShareToggle}
          >
            {post ? "Shared" : "Share"}
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

      {workout.description ? (
        <Text className="small muted" mb={3}>
          {workout.description}
        </Text>
      ) : null}

      {summary ? (
        <div className="stat-grid" style={{ marginBottom: 18 }}>
          <StatTile label="Duration" value={formatDuration(summary.durationMs)} />
          <StatTile label="Volume" value={formatVolume(summary.volume, workout.unit)} />
          <StatTile label="Sets" value={summary.sets} hint={`${summary.reps} reps`} />
          <StatTile label="Exercises" value={summary.exerciseCount} />
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {workout.exercises.map((exercise) => {
          const record = records.get(exercise.exerciseId);
          const hasRecord = record
            ? exercise.sets.some((set) => set.weight === record.weight && set.reps === record.reps)
            : false;

          return (
            <div className="workout-exercise" key={exercise.id}>
              <div className="workout-exercise-head">
                <span className="exercise-thumb">
                  <DumbbellIcon size={18} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="strong truncate" style={{ fontSize: 15 }}>
                    {exercise.name}
                  </div>
                  <div className="small muted">
                    {exercise.primaryMuscle} · {exercise.sets.length} sets
                  </div>
                </div>
                {hasRecord ? <span className="chip chip-success">PR</span> : null}
              </div>

              <div style={{ padding: "12px 16px 14px" }}>
                <div className="set-head">
                  <span>Set</span>
                  <span>{workout.unit.toUpperCase()}</span>
                  <span>Reps</span>
                  <span />
                  <span />
                </div>
                {exercise.sets.map((set, index) => (
                  <div className="set-row" key={set.id}>
                    <span className="set-index">{index + 1}</span>
                    <span className="set-value">{formatWeight(set.weight, workout.unit)}</span>
                    <span className="set-value">{set.reps ?? "—"}</span>
                    <span />
                    <span />
                  </div>
                ))}
                {exercise.notes ? (
                  <Text className="small muted" mt={2} fontStyle="italic">
                    “{exercise.notes}”
                  </Text>
                ) : null}
              </div>
            </div>
          );
        })}

        {workout.exercises.length === 0 ? (
          <div className="card">
            <EmptyState
              title="No exercises were logged"
              description="This session was saved without any sets. Start a new workout to log some work."
              action={
                <Button size="sm" as={Link} to="/workout">
                  Start workout
                </Button>
              }
            />
          </div>
        ) : null}
      </div>

      <Divider my={5} />

      <div style={{ display: "flex", gap: 8 }}>
        <Button size="sm" variant="ghost" as={Link} to="/history">
          Back to history
        </Button>
        <Button size="sm" variant="ghost" as={Link} to="/">
          Back to feed
        </Button>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Delete this workout?"
        body="The workout and any feed post created from it will be permanently removed."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          deleteWorkout(workout.id);
          navigate("/history");
        }}
        onClose={() => setConfirmDelete(false)}
      />

      <ConfirmDialog
        isOpen={confirmRepeat}
        title="A workout is already in progress"
        body="Repeating this workout will discard the session you are currently logging."
        confirmLabel="Discard and repeat"
        danger
        onConfirm={() => {
          discardWorkout();
          repeatWorkout(workout.id);
          navigate("/workout");
        }}
        onClose={() => setConfirmRepeat(false)}
      />
    </div>
  );
}
