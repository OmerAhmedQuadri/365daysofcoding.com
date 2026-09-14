export default function StudentCard({ entry, totalLabs }) {
  const pct = totalLabs > 0 ? Math.round((entry.labs_passed / totalLabs) * 100) : 0;

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-fg text-sm">{entry.user.name}</p>
          <p className="text-xs text-fg-subtle mt-0.5">{entry.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold text-brand-400">{entry.labs_passed}</p>
          <p className="text-xs text-fg-subtle">labs passed</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-400 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-fg-subtle tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
