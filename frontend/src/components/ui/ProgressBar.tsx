interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-brand-900/70 mb-1">
          <span>{label}</span>
          <span>{clamped}/100</span>
        </div>
      )}
      <div className="w-full h-2 bg-brand-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-400 rounded-full transition-all"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
