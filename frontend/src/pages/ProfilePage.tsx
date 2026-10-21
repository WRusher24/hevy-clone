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
  initials,
} from "../lib/format";
import {
  currentStreak,
  finishedWorkouts,
  muscleBreakdown,
  personalRecords,
  summarizeWorkout,
} from "../lib/stats";

export default function ProfilePage() {
  const { profile, workouts, routines, posts } = useApp();
  const finished = finishedWorkouts(workouts);
  const totalVolume = finished.reduce((sum, workout) => sum + summarizeWorkout(workout).volume, 0);
  const records = personalRecords(workouts);
  const muscles = muscleBreakdown(workouts, 30);
  const maxMuscleVolume = Math.max(1, ...muscles.map((entry) => entry.volume));
  const totalSets = finished.reduce((sum, workout) => sum + summarizeWorkout(workout).sets, 0);

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div className="avatar-initials" style={{ width: 64, height: 64, fontSize: 20 }}>
            {initials(profile.name)}
          </div>
          <div>
            <h1 className="page-title">{profile.name}</h1>
            <p className="page-subtitle">
              @{profile.handle} · {profile.unit.toUpperCase()}
              {profile.bodyweight ? ` · ${profile.bodyweight} ${profile.unit} BW` : ""}
            </p>
          </div>
        </div>
        <Button size="sm" variant="ghost" as={Link} to="/settings">
          Edit profile
        </Button>
      </div>

      {profile.bio ? (
        <Text className="small muted" mb={4} maxW="640px">
          {profile.bio}
        </Text>
      ) : null}

      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <StatTile label="Workouts" value={finished.length} hint={`${totalSets} sets logged`} />
        <StatTile label="Volume" value={formatVolume(totalVolume, profile.unit)} hint="All time" />
        <StatTile label="Streak" value={`${currentStreak(workouts)}d`} hint="Consecutive days" />
        <StatTile label="PRs" value={records.length} hint={`${posts.length} feed posts`} />
      </div>

      <div className="split-2">
        <div className="card">
          <div className="list-row">
            <span className="section-title" style={{ flex: 1 }}>
              Personal records
            </span>
            <span className="small muted">Best set</span>
          </div>
          {records.length === 0 ? (
            <EmptyState title="No PRs yet" description="Log a workout to set your first record." />
          ) : (
            records.slice(0, 10).map((record) => (
              <div className="list-row" key={record.exerciseId} style={{ padding: "10px 16px" }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="truncate" style={{ display: "block", fontSize: 13 }}>
                    {record.name}
                  </span>
                  <span className="small muted">{formatShortDate(record.date)}</span>
                </span>
                <span className="strong mono small">
                  {formatWeight(record.weight, record.unit)} × {record.reps}
                </span>
              </div>
            ))
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card card-pad">
            <div className="section-title" style={{ marginBottom: 12 }}>
              Volume by muscle · 30 days
            </div>
            {muscles.length === 0 ? (
              <Text className="small muted">No training data in the last 30 days.</Text>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {muscles.slice(0, 6).map((entry) => (
                  <div key={entry.muscle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        marginBottom: 4,
                      }}
                    >
                      <span>{entry.muscle}</span>
                      <span className="muted mono">
                        {formatVolume(entry.volume, profile.unit)}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${(entry.volume / maxMuscleVolume) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="list-row">
              <span className="section-title" style={{ flex: 1 }}>
                Recent workouts
              </span>
              <Link to="/history" className="small" style={{ color: "var(--accent)" }}>
                All
              </Link>
            </div>
            {finished.length === 0 ? (
              <div className="small muted" style={{ padding: "0 16px 16px" }}>
                Nothing logged yet.
              </div>
            ) : (
              finished.slice(0, 4).map((workout) => (
                <Link className="list-row" to={`/workout/${workout.id}`} key={workout.id}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span className="truncate" style={{ display: "block", fontSize: 13 }}>
                      {workout.title}
                    </span>
                    <span className="small muted">{formatShortDate(workout.startedAt)}</span>
                  </span>
                  <span className="small muted mono">
                    {formatDuration(summarizeWorkout(workout).durationMs)}
                  </span>
                </Link>
              ))
            )}
            <div className="list-row" style={{ paddingTop: 12 }}>
              <span className="small muted" style={{ flex: 1 }}>
                Routines
              </span>
              <span className="small strong">{routines.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
