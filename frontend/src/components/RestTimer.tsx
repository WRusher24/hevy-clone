import { CloseIcon } from "@chakra-ui/icons";
import { Button, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { formatClock } from "../lib/format";

interface RestTimerProps {
  endsAt: number;
  totalSeconds: number;
  onExtend: (seconds: number) => void;
  onDismiss: () => void;
}

export default function RestTimer({ endsAt, totalSeconds, onExtend, onDismiss }: RestTimerProps) {
  const [now, setNow] = useState(() => Date.now());
  const dismissed = useRef(false);

  useEffect(() => {
    dismissed.current = false;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [endsAt]);

  const remaining = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const progress =
    totalSeconds > 0 ? Math.min(100, Math.max(0, (remaining / totalSeconds) * 100)) : 0;

  useEffect(() => {
    if (remaining === 0 && !dismissed.current) {
      dismissed.current = true;
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(180);
      }
      onDismiss();
    }
  }, [remaining, onDismiss]);

  return (
    <div className="rest-timer" role="status" aria-live="polite">
      <div style={{ minWidth: 96 }}>
        <Text className="small muted" mb={1}>
          Rest timer
        </Text>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="rest-clock">{formatClock(remaining)}</div>

      <Button size="xs" variant="ghost" onClick={() => onExtend(15)}>
        +15s
      </Button>
      <Button
        size="xs"
        variant="ghost"
        aria-label="Skip rest"
        onClick={() => {
          dismissed.current = true;
          onDismiss();
        }}
      >
        <CloseIcon boxSize="10px" />
      </Button>
    </div>
  );
}
