import React from "react";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
}

export default function StatTile({ label, value, hint }: StatTileProps) {
  return (
    <div className="stat-tile">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {hint ? <div className="stat-hint">{hint}</div> : null}
    </div>
  );
}
