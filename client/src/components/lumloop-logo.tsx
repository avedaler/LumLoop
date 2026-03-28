export default function LumLoopLogo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="LumLoop"
      className={className}
    >
      {/* Outer ring — represents the loop/cycle */}
      <circle cx="20" cy="20" r="17" stroke="hsl(152 24% 48%)" strokeWidth="1.5" opacity="0.5" />
      {/* Inner organic loop — infinity/vitality */}
      <path
        d="M14 20C14 16 17 13 20 13C23 13 26 16 26 20C26 24 23 27 20 27C17 27 14 24 14 20Z"
        stroke="hsl(152 24% 48%)"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Pulse line through center */}
      <path
        d="M12 20H16L17.5 16L19.5 24L21.5 18L23 20H28"
        stroke="hsl(152 30% 55%)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small dot — precision/data point */}
      <circle cx="20" cy="20" r="1.5" fill="hsl(152 30% 55%)" />
    </svg>
  );
}
