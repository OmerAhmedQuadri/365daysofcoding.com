export default function StudentCard({ entry, totalLabs }) {
  const pct = totalLabs > 0 ? Math.round((entry.labs_passed / totalLabs) * 100) : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="font-medium text-gray-900 text-sm">{entry.user.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">{entry.user.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold text-indigo-600">{entry.labs_passed}</p>
          <p className="text-xs text-gray-400">labs passed</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs text-gray-400 tabular-nums">{pct}%</span>
      </div>
    </div>
  );
}
