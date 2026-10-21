import { Button, Text } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import StatTile from "../components/StatTile";
import { useApp } from "../context/AppContext";
import {
  formatDuration,
  formatShortDate,
  formatVolume,
  formatWeight,
  parseDate,
} from "../lib/format";
import {
  currentStreak,
  finishedWorkouts,
  summarizeWorkout,
  weeklyVolume,
  workoutsSince,
} from "../lib/stats";

export default function HistoryPage() {
  const { workouts, profile } = useApp();
  const finished = finishedWorkouts(workouts);
  const week = workoutsSince(workouts, 7);
  const totalVolume = finished.reduce((sum, workout) => sum + summarizeWorkout(workout).volume, 0);
  const weeks = weeklyVolume(workouts, 8);
  const maxVolume = Math.max(1, ...weeks.map((point) => point.volume));

  const groups: Array<{ label: string; items: typeof finished }> = [];
  finished.forEach((workout) => {
    const label = parseDate(workout.startedAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    const existing = groups.find((group) => group.label === label);
    if (existing) existing.items.push(workout);
    else groups.push({ label, items: [workout] });
  });

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout History</h1>
          <p className="page-subtitle">Every session you have logged, newest first.</p>
        </div>
        <Button size="sm" as={Link} to="/workout">
          Log workout
        </Button>
      </div>

      <div className="stat-grid" style={{ marginBottom: 16 }}>
        <StatTile label="Workouts" value={finished.length} hint="All time" />
        <StatTile label="This week" value={week.length} hint={`Goal ${profile.weeklyGoal}`} />
        <StatTile label="Streak" value={`${currentStreak(workouts)}d`} hint="Consecutive days" />
        <StatTile label="Total volume" value={formatVolume(totalVolume, profile.unit)} hint="All time" />
      </div>

      <div className="card card-pad" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span className="section-title">Volume · last 8 weeks</span>
          <Text className="small muted">{formatVolume(totalVolume, profile.unit)} total</Text>
        </div>
        <div className="chart-bars">
          {weeks.map((point) => (
            <div className="chart-col" key={point.label}>
              <div
                className="chart-bar"
                style={{
                  height: `${Math.max(4, (point.volume / maxVolume) * 100)}%`,
                  background: point.volume === 0 ? "#1b2431" : undefined,
                }}
                title={`${point.label}: ${formatVolume(point.volume, profile.unit)}`}
              />
              <span className="chart-label">{point.label}</span>
            </div>
          ))}
        </div>
      </div>

      {finished.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No workouts yet"
            description="Finish your first workout and it will appear here with volume, duration and PRs."
            action={
              <Button size="sm" as={Link} to="/workout">
                Start a workout
              </Button>
            }
          />
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {groups.map((group) => (
            <div key={group.label}>
              <div className="section-title" style={{ marginBottom: 8 }}>
                {group.label}
              </div>
              <div className="card">
                {group.items.map((workout) => {
                  const summary = summarizeWorkout(workout);
                  const topSet = workout.exercises
                    .flatMap((exercise) => exercise.sets)
                    .filter((set) => set.weight !== null && set.weight > 0)
                    .sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];

                  return (
                    <Link className="list-row" to={`/workout/${workout.id}`} key={workout.id}>
                      <span
                        className="chip"
                        style={{ width: 62, justifyContent: "center", flex: "0 0 auto" }}
                      >
                        {formatShortDate(workout.startedAt)}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span className="strong truncate" style={{ display: "block", fontSize: 14 }}>
                          {workout.title}
                        </span>
                        <span className="small muted">
                          {formatDuration(summary.durationMs)} · {summary.sets} sets ·{" "}
                          {summary.exerciseCount} exercises
                        </span>
                      </span>
                      <span style={{ textAlign: "right" }}>
                        <span className="strong mono" style={{ display: "block", fontSize: 14 }}>
                          {formatVolume(summary.volume, workout.unit)}
                        </span>
                        {topSet ? (
                          <span className="small muted mono">
                            top {formatWeight(topSet.weight, workout.unit)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
