import { motion } from 'framer-motion';

/**
 * CircularProgress - A circular SVG progress indicator for file transfers.
 * 
 * Props:
 *   progress  - 0 to 100 (percentage)
 *   size      - diameter in px (default 120)
 *   strokeWidth - ring thickness in px (default 8)
 *   label     - optional text below the percentage
 */
export default function CircularProgress({ progress = 0, size = 120, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  const center = size / 2;

  // Dynamic color: gray → blue → emerald as progress grows
  const getColor = (pct) => {
    if (pct < 30) return { stroke: '#3b82f6', shadow: 'rgba(59,130,246,0.35)' };   // blue
    if (pct < 70) return { stroke: '#8b5cf6', shadow: 'rgba(139,92,246,0.35)' };   // purple
    return { stroke: '#10b981', shadow: 'rgba(16,185,129,0.35)' };                  // emerald
  };

  const color = getColor(progress);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
            opacity={0.5}
          />
          {/* Progress arc */}
          <motion.circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color.stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{
              filter: `drop-shadow(0 0 6px ${color.shadow})`,
            }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(progress)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xl font-bold text-[var(--color-text-primary)] tabular-nums"
          >
            {Math.round(progress)}%
          </motion.span>
        </div>
      </div>

      {label && (
        <span className="text-xs text-[var(--color-text-secondary)] text-center max-w-[160px] truncate">
          {label}
        </span>
      )}
    </div>
  );
}
