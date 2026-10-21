import React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export default function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ? <div style={{ fontSize: 26, opacity: 0.7 }}>{icon}</div> : null}
      <div className="strong" style={{ color: "var(--text)", fontSize: 15 }}>
        {title}
      </div>
      {description ? <div className="small" style={{ maxWidth: 380 }}>{description}</div> : null}
      {action ? <div style={{ marginTop: 10 }}>{action}</div> : null}
    </div>
  );
}
