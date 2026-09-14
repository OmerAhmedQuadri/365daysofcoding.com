import { Link } from 'react-router-dom';

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-fg-subtle shrink-0 mt-0.5">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}

export default function TopicCard({ topic, isLocked }) {
  const { passed_labs = 0, total_labs = topic.lab_count ?? 0, is_complete = false } = topic;

  const progressLabel = is_complete
    ? 'Complete'
    : total_labs === 0
      ? 'No labs yet'
      : `${passed_labs} of ${total_labs} labs done`;

  const inner = (
    <div
      className={`rounded-xl border p-5 transition-colors ${
        isLocked
          ? 'border-line bg-canvas cursor-not-allowed opacity-60'
          : 'border-line bg-surface hover:border-brand-500/50 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-fg truncate">{topic.title}</p>
          <p className="mt-1 text-sm text-fg-muted">{progressLabel}</p>
        </div>
        {isLocked ? (
          <LockIcon />
        ) : is_complete ? (
          <span className="shrink-0 text-xs font-medium text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-2 py-0.5">
            Done
          </span>
        ) : null}
      </div>

      {!isLocked && total_labs > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-raised overflow-hidden">
          <div
            className="h-full rounded-full bg-brand-400 transition-all"
            style={{ width: `${(passed_labs / total_labs) * 100}%` }}
          />
        </div>
      )}
    </div>
  );

  if (isLocked) return inner;
  return <Link to={`/topics/${topic.id}`}>{inner}</Link>;
}
