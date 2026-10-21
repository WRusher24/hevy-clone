interface IconProps {
  size?: number;
  className?: string;
}

/** Simple dumbbell glyph used instead of emoji so it renders everywhere. */
export function DumbbellIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      style={{ opacity: 0.85 }}
    >
      <path d="M6.5 6.5v11" />
      <path d="M3.5 9v5" />
      <path d="M17.5 6.5v11" />
      <path d="M20.5 9v5" />
      <path d="M6.5 12h11" />
    </svg>
  );
}

export function FlameIcon({ size = 18, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3c2.5 3.5 1 5.5 3 7.5 1.3 1.3 2.5 2.3 2.5 4.5A5.5 5.5 0 0 1 12 20.5 5.5 5.5 0 0 1 6.5 15c0-2.2 1.2-3.2 2.5-4.5 2-2 0.5-4 3-7.5Z" />
    </svg>
  );
}
