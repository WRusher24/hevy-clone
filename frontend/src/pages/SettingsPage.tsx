import { DownloadIcon } from "@chakra-ui/icons";
import {
  Button,
  Divider,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Text,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useApp } from "../context/AppContext";
import { config } from "../config";
import { exportStateJson } from "../lib/storage";
import { WeightUnit } from "../Types";

export default function SettingsPage() {
  const {
    profile,
    exercises,
    routines,
    folders,
    workouts,
    posts,
    activeWorkout,
    updateProfile,
    resetAll,
  } = useApp();
  const toast = useToast();

  const [name, setName] = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio] = useState(profile.bio);
  const [unit, setUnit] = useState<WeightUnit>(profile.unit);
  const [bodyweight, setBodyweight] = useState(
    profile.bodyweight === null ? "" : String(profile.bodyweight)
  );
  const [weeklyGoal, setWeeklyGoal] = useState(String(profile.weeklyGoal));
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSave = () => {
    const parsedBodyweight = Number(bodyweight);
    updateProfile({
      name: name.trim() || "Athlete",
      handle: handle.trim().replace(/^@/, "").toLowerCase() || "athlete",
      bio: bio.trim(),
      unit,
      bodyweight: bodyweight.trim() === "" || !Number.isFinite(parsedBodyweight) ? null : parsedBodyweight,
      weeklyGoal: Math.max(1, Math.min(14, Number(weeklyGoal) || 4)),
    });
    toast({ title: "Profile updated", status: "success", duration: 1800, isClosable: true });
  };

  const handleExport = () => {
    const json = exportStateJson({
      profile,
      exercises,
      routines,
      folders,
      workouts,
      posts,
      activeWorkout,
    });
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `hevy-clone-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast({ title: "Export downloaded", status: "success", duration: 1800 });
  };

  return (
    <div className="page page-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Profile details, units and local data.</p>
        </div>
        <Button size="sm" onClick={handleSave}>
          Save changes
        </Button>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          Profile
        </div>
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }}>
          <div>
            <Text className="small muted" mb={1}>
              Display name
            </Text>
            <Input size="sm" value={name} onChange={(event) => setName(event.target.value)} />
          </div>
          <div>
            <Text className="small muted" mb={1}>
              Handle
            </Text>
            <Input
              size="sm"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="alexlifts"
            />
          </div>
        </div>

        <Text className="small muted" mt={3} mb={1}>
          Bio
        </Text>
        <Textarea
          size="sm"
          rows={2}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="A line about your training"
        />

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            marginTop: 12,
          }}
        >
          <div>
            <Text className="small muted" mb={1}>
              Weight unit
            </Text>
            <Select
              size="sm"
              value={unit}
              onChange={(event) => setUnit(event.target.value as WeightUnit)}
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="lb">Pounds (lb)</option>
            </Select>
          </div>
          <div>
            <Text className="small muted" mb={1}>
              Bodyweight ({unit})
            </Text>
            <NumberInput size="sm" min={0} value={bodyweight} onChange={(value) => setBodyweight(value)}>
              <NumberInputField placeholder="Optional" />
            </NumberInput>
          </div>
          <div>
            <Text className="small muted" mb={1}>
              Weekly goal (sessions)
            </Text>
            <NumberInput size="sm" min={1} max={14} value={weeklyGoal} onChange={(value) => setWeeklyGoal(value)}>
              <NumberInputField />
            </NumberInput>
          </div>
        </div>

        <Text className="small muted" mt={3}>
          Changing units does not convert existing workouts — each workout keeps the unit it was
          logged in.
        </Text>
      </div>

      <div className="card card-pad" style={{ marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>
          Data
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 420 }}>
            <Text className="small">
              {config.isConfiguredForRemoteApi
                ? `Connected to API at ${config.apiBaseUrl}`
                : "Running in offline mode — data is stored in this browser only."}
            </Text>
            <Text className="small muted" mt={1}>
              {workouts.length} workouts · {routines.length} routines · {exercises.length} exercises
            </Text>
          </div>
          <Button size="sm" variant="ghost" leftIcon={<DownloadIcon />} onClick={handleExport}>
            Export JSON
          </Button>
        </div>

        <Divider my={4} />

        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 420 }}>
            <Text className="small strong">Reset all data</Text>
            <Text className="small muted">
              Deletes workouts, routines and posts, then restores the demo content.
            </Text>
          </div>
          <Button size="sm" colorScheme="red" variant="outline" onClick={() => setConfirmReset(true)}>
            Reset
          </Button>
        </div>
      </div>

      <div className="card card-pad">
        <div className="section-title" style={{ marginBottom: 8 }}>
          About
        </div>
        <Text className="small muted">
          {config.appName} · built with React, TypeScript and Chakra UI. Configuration comes from
          environment variables (<code>REACT_APP_*</code>) documented in <code>.env.example</code>.
        </Text>
        <Text className="small muted" mt={2}>
          Storage namespace: <code>{config.storageKey}</code>
        </Text>
      </div>

      <ConfirmDialog
        isOpen={confirmReset}
        title="Reset all data?"
        body="Every workout, routine and post in this browser will be replaced with fresh demo data."
        confirmLabel="Reset everything"
        danger
        onConfirm={() => {
          resetAll();
          toast({ title: "Data reset", status: "info", duration: 1800 });
        }}
        onClose={() => setConfirmReset(false)}
      />
    </div>
  );
}
