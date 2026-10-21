import { AddIcon, SearchIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatTile from "../components/StatTile";
import { useApp } from "../context/AppContext";
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from "../lib/exercises";
import { matchesQuery } from "../lib/search";
import { formatNumber, formatShortDate, formatWeight, timeAgo } from "../lib/format";
import { exerciseHistory, personalRecords } from "../lib/stats";
import { Equipment, Exercise, MuscleGroup } from "../Types";
import { DumbbellIcon } from "../components/icons";

export default function ExercisesPage() {
  const {
    exercises,
    workouts,
    activeWorkout,
    addExerciseToActive,
    createExercise,
    startEmptyWorkout,
  } = useApp();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "All">("All");
  const [equipment, setEquipment] = useState<Equipment | "All">("All");
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("Chest");
  const [newEquipment, setNewEquipment] = useState<Equipment>("Barbell");

  const records = useMemo(() => {
    const map = new Map(personalRecords(workouts).map((record) => [record.exerciseId, record]));
    return map;
  }, [workouts]);

  const filtered = useMemo(() => {
    return exercises
      .filter((exercise) => {
        const matchesMuscle = muscle === "All" || exercise.primaryMuscle === muscle;
        const matchesEquipment = equipment === "All" || exercise.equipment === equipment;
        const matchesSearch = matchesQuery(
          [exercise.name, exercise.primaryMuscle, exercise.equipment],
          query
        );
        return matchesMuscle && matchesEquipment && matchesSearch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [equipment, exercises, muscle, query]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createExercise({ name: newName, primaryMuscle: newMuscle, equipment: newEquipment });
    setNewName("");
    setCreateOpen(false);
  };

  const handleAddToWorkout = (exercise: Exercise) => {
    if (!activeWorkout) startEmptyWorkout();
    addExerciseToActive(exercise.id);
    navigate("/workout");
  };

  const selectedHistory = selected ? exerciseHistory(workouts, selected.id).slice(0, 6).reverse() : [];
  const selectedRecord = selected ? records.get(selected.id) : undefined;
  const historyWeights = selectedHistory.map((point) => point.topWeight);
  const minHistoryWeight = historyWeights.length > 0 ? Math.min(...historyWeights) : 0;
  const maxHistoryWeight = historyWeights.length > 0 ? Math.max(...historyWeights) : 0;
  const historySpan = Math.max(1, maxHistoryWeight - minHistoryWeight);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercise Library</h1>
          <p className="page-subtitle">
            {exercises.length} movements with your personal records and history.
          </p>
        </div>
        <Button size="sm" leftIcon={<AddIcon boxSize="10px" />} onClick={() => setCreateOpen(true)}>
          New exercise
        </Button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)" }}>
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search by name, muscle or equipment"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <Select
            size="sm"
            value={muscle}
            onChange={(event) => setMuscle(event.target.value as MuscleGroup | "All")}
          >
            <option value="All">All muscles</option>
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>
          <Select
            size="sm"
            value={equipment}
            onChange={(event) => setEquipment(event.target.value as Equipment | "All")}
          >
            <option value="All">All equipment</option>
            {EQUIPMENT_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="card">
        {filtered.map((exercise) => {
          const record = records.get(exercise.id);
          return (
            <button
              key={exercise.id}
              type="button"
              className="list-row"
              onClick={() => setSelected(exercise)}
            >
              <span className="exercise-thumb">
                <DumbbellIcon size={18} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span className="strong truncate" style={{ display: "block", fontSize: 14 }}>
                  {exercise.name}
                </span>
                <span className="small muted">
                  {exercise.primaryMuscle} · {exercise.equipment}
                  {exercise.isCustom ? " · custom" : ""}
                </span>
              </span>
              {record ? (
                <span className="chip chip-success mono">
                  PR {formatWeight(record.weight, record.unit)} × {record.reps}
                </span>
              ) : (
                <span className="chip">No data</span>
              )}
            </button>
          );
        })}

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="strong" style={{ color: "var(--text)" }}>
              No exercises found
            </div>
            <div className="small">Try a different search, or create a custom exercise.</div>
            <Button size="sm" mt={2} onClick={() => setCreateOpen(true)}>
              Create exercise
            </Button>
          </div>
        ) : null}
      </div>

      {/* Exercise detail */}
      <Modal
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        size="lg"
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{selected?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selected ? (
              <>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                  <span className="chip chip-accent">{selected.primaryMuscle}</span>
                  <span className="chip">{selected.equipment}</span>
                  <span className="chip">{selected.category}</span>
                  {selected.isCustom ? <span className="chip">Custom</span> : null}
                </div>

                <div className="stat-grid" style={{ marginBottom: 16 }}>
                  <StatTile
                    label="Best set"
                    value={
                      selectedRecord
                        ? `${formatWeight(selectedRecord.weight, selectedRecord.unit)} × ${selectedRecord.reps}`
                        : "—"
                    }
                    hint={selectedRecord ? timeAgo(selectedRecord.date) : "No sets logged"}
                  />
                  <StatTile
                    label="Sessions"
                    value={selectedHistory.length}
                    hint="Logged sessions"
                  />
                </div>

                <Text className="section-title" mb={2}>
                  Top set trend
                </Text>
                {selectedHistory.length === 0 ? (
                  <Text className="small muted">
                    Nothing logged yet. Add this exercise to a workout to start building history.
                  </Text>
                ) : (
                  <div className="chart-bars" style={{ height: 118 }}>
                    {selectedHistory.map((point) => {
                      const ratio = (point.topWeight - minHistoryWeight) / historySpan;
                      return (
                        <div className="chart-col" key={point.workoutId}>
                          <span className="chart-value">
                            {formatNumber(point.topWeight, 1)}
                          </span>
                          <div
                            className="chart-bar"
                            style={{ height: `${34 + ratio * 44}px` }}
                            title={`${point.topWeight} kg on ${formatShortDate(point.date)}`}
                          />
                          <span className="chart-label">{formatShortDate(point.date)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Divider my={4} />

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    size="sm"
                    leftIcon={<AddIcon boxSize="10px" />}
                    onClick={() => {
                      handleAddToWorkout(selected);
                      setSelected(null);
                    }}
                  >
                    {activeWorkout ? "Add to current workout" : "Start workout with this"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                </div>
              </>
            ) : null}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Create exercise */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New exercise</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text className="small muted" mb={2}>
              Name
            </Text>
            <Input
              mb={3}
              size="sm"
              autoFocus
              placeholder="e.g. Incline Cable Fly"
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
            <Text className="small muted" mb={2}>
              Primary muscle
            </Text>
            <Select
              mb={3}
              size="sm"
              value={newMuscle}
              onChange={(event) => setNewMuscle(event.target.value as MuscleGroup)}
            >
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
            <Text className="small muted" mb={2}>
              Equipment
            </Text>
            <Select
              mb={4}
              size="sm"
              value={newEquipment}
              onChange={(event) => setNewEquipment(event.target.value as Equipment)}
            >
              {EQUIPMENT_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Button width="100%" size="sm" onClick={handleCreate} isDisabled={!newName.trim()}>
              Create exercise
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
}
