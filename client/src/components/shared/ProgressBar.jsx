import { motion } from 'framer-motion';

export default function ProgressBar({ value, label, className = '' }) {
  const pct = Math.min(100, Math.max(0, value ?? 0));

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-brand-400"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {label !== undefined && (
        <span className="shrink-0 text-xs text-fg-subtle tabular-nums">{label}</span>
      )}
    </div>
  );
}
