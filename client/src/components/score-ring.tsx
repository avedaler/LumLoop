interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
  className?: string;
}

export default function ScoreRing({
  score,
  size = 120,
  strokeWidth = 6,
  label,
  color = "hsl(152 24% 48%)",
  className = "",
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(220 6% 15%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Score ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ animation: "scoreRing 1.2s ease-out forwards" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl font-semibold text-foreground tracking-tight">
          {score}
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
