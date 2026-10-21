import { AddIcon } from "@chakra-ui/icons";
import { Button, Text } from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import EmptyState from "../components/EmptyState";
import FeedWorkoutCard from "../components/FeedWorkoutCard";
import StatTile from "../components/StatTile";
import { useApp } from "../context/AppContext";
import { formatVolume, formatWeight } from "../lib/format";
import { currentStreak, personalRecords, summarizeWorkout, workoutsSince } from "../lib/stats";

type FeedFilter = "all" | "mine";

export default function FeedPage() {
  const { posts, workouts, profile, routines, activeWorkout, startEmptyWorkout } = useApp();
  const [filter, setFilter] = useState<FeedFilter>("all");
  const navigate = useNavigate();

  const visiblePosts = useMemo(
    () => (filter === "mine" ? posts.filter((post) => post.handle === profile.handle) : posts),
    [filter, posts, profile.handle]
  );

  const weekWorkouts = workoutsSince(workouts, 7);
  const weekVolume = weekWorkouts.reduce(
    (sum, workout) => sum + summarizeWorkout(workout).volume,
    0
  );
  const streak = currentStreak(workouts);
  const records = personalRecords(workouts).slice(0, 3);
  const goalProgress = Math.min(100, (weekWorkouts.length / Math.max(1, profile.weeklyGoal)) * 100);

  const handleStart = () => {
    if (!activeWorkout) startEmptyWorkout();
    navigate("/workout");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Feed</h1>
          <p className="page-subtitle">Workouts from you and the people you follow.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="ghost" as={Link} to="/routines">
            Routines
          </Button>
          <Button size="sm" leftIcon={<AddIcon boxSize="10px" />} onClick={handleStart}>
            {activeWorkout ? "Resume workout" : "Log workout"}
          </Button>
        </div>
      </div>

      <div className="grid-feed">
        <div>
          <div className="filter-bar" style={{ marginBottom: 14 }}>
            <Button
              size="xs"
              variant={filter === "all" ? "solid" : "ghost"}
              onClick={() => setFilter("all")}
            >
              Everyone
            </Button>
            <Button
              size="xs"
              variant={filter === "mine" ? "solid" : "ghost"}
              onClick={() => setFilter("mine")}
            >
              My posts
            </Button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {visiblePosts.map((post) => (
              <FeedWorkoutCard key={post.id} post={post} />
            ))}

            {visiblePosts.length === 0 ? (
              <div className="card">
                <EmptyState
                  title={filter === "mine" ? "You haven't posted yet" : "The feed is quiet"}
                  description="Finish a workout and publish it to the feed to share it with your followers."
                  action={
                    <Button size="sm" onClick={handleStart}>
                      Start a workout
                    </Button>
                  }
                />
              </div>
            ) : null}
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card card-pad">
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}
            >
              <span className="section-title">This week</span>
              <Text className="small muted mono">
                {weekWorkouts.length}/{profile.weeklyGoal}
              </Text>
            </div>
            <div className="progress-track" style={{ marginTop: 12 }}>
              <div className="progress-fill" style={{ width: `${goalProgress}%` }} />
            </div>
            <Text className="small muted" mt={2}>
              {weekWorkouts.length >= profile.weeklyGoal
                ? "Weekly goal smashed. Keep it rolling."
                : `${profile.weeklyGoal - weekWorkouts.length} more session${
                    profile.weeklyGoal - weekWorkouts.length === 1 ? "" : "s"
                  } to hit your goal.`}
            </Text>
          </div>

          <div className="stat-grid">
            <StatTile label="Streak" value={`${streak}d`} hint="Consecutive training days" />
            <StatTile
              label="7-day volume"
              value={formatVolume(weekVolume, profile.unit)}
              hint={`${weekWorkouts.length} workouts`}
            />
          </div>

          <div className="card">
            <div className="list-row" style={{ paddingBottom: 8 }}>
              <span className="section-title" style={{ flex: 1 }}>
                Personal records
              </span>
              <Link to="/profile" className="small" style={{ color: "var(--accent)" }}>
                All
              </Link>
            </div>
            {records.length === 0 ? (
              <div className="small muted" style={{ padding: "0 16px 16px" }}>
                Log a few sets to start tracking PRs.
              </div>
            ) : (
              <div style={{ paddingBottom: 8 }}>
                {records.map((record) => (
                  <div key={record.exerciseId} className="list-row" style={{ padding: "9px 16px" }}>
                    <span className="truncate" style={{ flex: 1, fontSize: 13 }}>
                      {record.name}
                    </span>
                    <span className="small strong mono">
                      {formatWeight(record.weight, record.unit)} × {record.reps}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="list-row" style={{ paddingBottom: 8 }}>
              <span className="section-title" style={{ flex: 1 }}>
                Your routines
              </span>
              <Link to="/routines" className="small" style={{ color: "var(--accent)" }}>
                Manage
              </Link>
            </div>
            {routines.length === 0 ? (
              <div className="small muted" style={{ padding: "0 16px 16px" }}>
                Build a routine to start faster.
              </div>
            ) : (
              routines.slice(0, 4).map((routine) => (
                <Link to={`/routines/${routine.id}`} className="list-row" key={routine.id}>
                  <span className="truncate" style={{ flex: 1, fontSize: 13 }}>
                    {routine.name}
                  </span>
                  <span className="chip">{routine.exercises.length} ex</span>
                </Link>
              ))
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
