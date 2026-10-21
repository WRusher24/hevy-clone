import { AddIcon, DeleteIcon, EditIcon, RepeatIcon } from "@chakra-ui/icons";
import {
  Button,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import { useApp } from "../context/AppContext";
import { timeAgo } from "../lib/format";

export default function RoutinesPage() {
  const {
    routines,
    folders,
    activeWorkout,
    deleteRoutine,
    duplicateRoutine,
    moveRoutine,
    createFolder,
    renameFolder,
    deleteFolder,
    startWorkoutFromRoutine,
    discardWorkout,
  } = useApp();
  const navigate = useNavigate();

  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [manageOpen, setManageOpen] = useState(false);
  const [newFolder, setNewFolder] = useState("");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [pendingStart, setPendingStart] = useState<string | null>(null);

  const visible = useMemo(() => {
    if (activeFolder === "all") return routines;
    if (activeFolder === "none") return routines.filter((routine) => !routine.folderId);
    return routines.filter((routine) => routine.folderId === activeFolder);
  }, [activeFolder, routines]);

  const folderName = (id: string | null) =>
    id ? folders.find((folder) => folder.id === id)?.name ?? null : null;

  const handleStart = (id: string) => {
    if (activeWorkout) {
      setPendingStart(id);
      return;
    }
    startWorkoutFromRoutine(id);
    navigate("/workout");
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Routines</h1>
          <p className="page-subtitle">
            {routines.length} routine{routines.length === 1 ? "" : "s"} · {folders.length} folder
            {folders.length === 1 ? "" : "s"}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => setManageOpen(true)}>
            Folders
          </Button>
          <Button size="sm" as={Link} to="/routines/new" leftIcon={<AddIcon boxSize="10px" />}>
            New routine
          </Button>
        </div>
      </div>

      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <Button
          size="xs"
          variant={activeFolder === "all" ? "solid" : "ghost"}
          onClick={() => setActiveFolder("all")}
        >
          All
        </Button>
        {folders.map((folder) => (
          <Button
            key={folder.id}
            size="xs"
            variant={activeFolder === folder.id ? "solid" : "ghost"}
            onClick={() => setActiveFolder(folder.id)}
          >
            {folder.name}
          </Button>
        ))}
        <Button
          size="xs"
          variant={activeFolder === "none" ? "solid" : "ghost"}
          onClick={() => setActiveFolder("none")}
        >
          Unfiled
        </Button>
      </div>

      {visible.length === 0 ? (
        <div className="card">
          <EmptyState
            title="No routines here yet"
            description="Routines let you start a planned workout in one tap, with target sets and rep ranges."
            action={
              <Button size="sm" as={Link} to="/routines/new">
                Create your first routine
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid-cards">
          {visible.map((routine) => (
            <div className="card card-pad card-hover" key={routine.id}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                <Link to={`/routines/${routine.id}`} style={{ flex: 1, minWidth: 0 }}>
                  <div className="strong truncate" style={{ fontSize: 16 }}>
                    {routine.name}
                  </div>
                  <div className="small muted" style={{ marginTop: 3 }}>
                    {routine.exercises.length} exercises · updated {timeAgo(routine.updatedAt)}
                  </div>
                </Link>

                <Menu placement="bottom-end">
                  <MenuButton
                    as={Button}
                    size="xs"
                    variant="ghost"
                    aria-label={`${routine.name} options`}
                  >
                    ···
                  </MenuButton>
                  <MenuList fontSize="sm">
                    <MenuItem icon={<RepeatIcon />} onClick={() => handleStart(routine.id)}>
                      Start workout
                    </MenuItem>
                    <MenuItem
                      icon={<EditIcon />}
                      as={Link}
                      to={`/routines/${routine.id}/edit`}
                    >
                      Edit routine
                    </MenuItem>
                    <MenuItem onClick={() => duplicateRoutine(routine.id)}>Duplicate</MenuItem>
                    <MenuItem onClick={() => moveRoutine(routine.id, null)}>
                      Move to unfiled
                    </MenuItem>
                    {folders.map((folder) => (
                      <MenuItem
                        key={folder.id}
                        onClick={() => moveRoutine(routine.id, folder.id)}
                        isDisabled={routine.folderId === folder.id}
                      >
                        Move to “{folder.name}”
                      </MenuItem>
                    ))}
                    <MenuItem
                      icon={<DeleteIcon />}
                      color="red.300"
                      onClick={() => setPendingDelete(routine.id)}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Menu>
              </div>

              {routine.notes ? (
                <Text className="small muted" mt={2} noOfLines={2}>
                  {routine.notes}
                </Text>
              ) : null}

              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                <span className="chip">{routine.exercises.length} exercises</span>
                {folderName(routine.folderId) ? (
                  <span className="chip chip-accent">{folderName(routine.folderId)}</span>
                ) : null}
              </div>

              <Button
                size="sm"
                width="100%"
                mt={3}
                variant="outline"
                leftIcon={<RepeatIcon />}
                onClick={() => handleStart(routine.id)}
              >
                Start workout
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={manageOpen} onClose={() => setManageOpen(false)} size="md" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Folders</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {folders.length === 0 ? (
              <Text className="small muted" mb={3}>
                Folders keep your routines organised by programme or training block.
              </Text>
            ) : (
              folders.map((folder) => (
                <div key={folder.id} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <Input
                    size="sm"
                    defaultValue={folder.name}
                    onBlur={(event) => renameFolder(folder.id, event.target.value)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    color="red.300"
                    onClick={() => deleteFolder(folder.id)}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              ))
            )}

            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Input
                size="sm"
                placeholder="New folder name"
                value={newFolder}
                onChange={(event) => setNewFolder(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && newFolder.trim()) {
                    createFolder(newFolder);
                    setNewFolder("");
                  }
                }}
              />
              <Button
                size="sm"
                isDisabled={!newFolder.trim()}
                onClick={() => {
                  createFolder(newFolder);
                  setNewFolder("");
                }}
              >
                Add
              </Button>
            </div>
            <Text className="small muted" mt={2}>
              Renaming saves when you click outside the field.
            </Text>
          </ModalBody>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="Delete this routine?"
        body="The routine will be removed. Workouts already logged from it stay in your history."
        confirmLabel="Delete"
        danger
        onConfirm={() => {
          if (pendingDelete) deleteRoutine(pendingDelete);
        }}
        onClose={() => setPendingDelete(null)}
      />

      <ConfirmDialog
        isOpen={pendingStart !== null}
        title="A workout is already in progress"
        body="Starting this routine will discard the workout you are currently logging."
        confirmLabel="Discard and start"
        danger
        onConfirm={() => {
          if (!pendingStart) return;
          discardWorkout();
          startWorkoutFromRoutine(pendingStart);
          navigate("/workout");
        }}
        onClose={() => setPendingStart(null)}
      />
    </div>
  );
}
