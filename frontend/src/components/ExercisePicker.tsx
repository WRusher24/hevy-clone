import { SearchIcon } from "@chakra-ui/icons";
import {
  Box,
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
import { useApp } from "../context/AppContext";
import { EQUIPMENT_OPTIONS, MUSCLE_GROUPS } from "../lib/exercises";
import { matchesQuery } from "../lib/search";
import { Equipment, Exercise, MuscleGroup } from "../Types";
import { DumbbellIcon } from "./icons";

interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
  title?: string;
}

export default function ExercisePicker({
  isOpen,
  onClose,
  onSelect,
  title = "Add Exercise",
}: ExercisePickerProps) {
  const { exercises, createExercise } = useApp();
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState<MuscleGroup | "All">("All");
  const [showCreate, setShowCreate] = useState(false);
  const [newMuscle, setNewMuscle] = useState<MuscleGroup>("Chest");
  const [newEquipment, setNewEquipment] = useState<Equipment>("Barbell");

  const results = useMemo(() => {
    return exercises
      .filter((exercise) => {
        const matchesMuscle = muscle === "All" || exercise.primaryMuscle === muscle;
        const matchesSearch = matchesQuery(
          [exercise.name, exercise.primaryMuscle, exercise.equipment],
          query
        );
        return matchesMuscle && matchesSearch;
      })
      .sort((a, b) => {
        if (a.isCustom !== b.isCustom) return a.isCustom ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }, [exercises, muscle, query]);

  const reset = () => {
    setQuery("");
    setMuscle("All");
    setShowCreate(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePick = (exercise: Exercise) => {
    onSelect(exercise);
    reset();
    onClose();
  };

  const handleCreate = () => {
    const name = query.trim();
    if (!name) return;
    const created = createExercise({
      name,
      primaryMuscle: newMuscle,
      equipment: newEquipment,
    });
    handlePick(created);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" scrollBehavior="inside" isCentered>
      <ModalOverlay />
      <ModalContent maxH="82vh">
        <ModalHeader pb={2}>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={5}>
          <InputGroup size="sm" mb={2}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              autoFocus
              placeholder="Search 100+ exercises"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>

          <Select
            size="sm"
            mb={3}
            value={muscle}
            onChange={(event) => setMuscle(event.target.value as MuscleGroup | "All")}
          >
            <option value="All">All muscle groups</option>
            {MUSCLE_GROUPS.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </Select>

          <Text className="small muted" mb={2}>
            {results.length} exercise{results.length === 1 ? "" : "s"}
          </Text>

          <Box className="scroll-list" style={{ maxHeight: "44vh" }}>
            {results.map((exercise) => (
              <button
                key={exercise.id}
                type="button"
                className="list-row"
                onClick={() => handlePick(exercise)}
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
                <span className="chip chip-accent">Add</span>
              </button>
            ))}

            {results.length === 0 ? (
              <Box py={6} textAlign="center">
                <Text className="muted" fontSize="sm" mb={3}>
                  No exercises match “{query}”.
                </Text>
                <Button size="sm" onClick={() => setShowCreate(true)}>
                  Create “{query.trim()}”
                </Button>
              </Box>
            ) : null}
          </Box>

          {showCreate ? (
            <Box mt={4} p={3} borderRadius="12px" bg="surface.700" borderWidth="1px" borderColor="surface.500">
              <Text className="small strong" mb={2}>
                New custom exercise
              </Text>
              <Select
                size="sm"
                mb={2}
                value={newMuscle}
                onChange={(event) => setNewMuscle(event.target.value as MuscleGroup)}
              >
                {MUSCLE_GROUPS.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </Select>
              <Select
                size="sm"
                mb={3}
                value={newEquipment}
                onChange={(event) => setNewEquipment(event.target.value as Equipment)}
              >
                {EQUIPMENT_OPTIONS.map((equipment) => (
                  <option key={equipment} value={equipment}>
                    {equipment}
                  </option>
                ))}
              </Select>
              <Button size="sm" width="100%" onClick={handleCreate} isDisabled={!query.trim()}>
                Save & add
              </Button>
            </Box>
          ) : null}

          <Divider my={4} />
          <Button
            size="sm"
            variant="ghost"
            width="100%"
            onClick={() => setShowCreate((value) => !value)}
          >
            {showCreate ? "Hide custom exercise form" : "+ Create custom exercise"}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
