import { Link } from 'react-router-dom';

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-fg-subtle shrink-0">
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
    </svg>
  );
}

const FORMAT_LABEL = {
  problem_solving: 'Problem Solving',
  fix_the_bug: 'Fix the Bug',
};

const FORMAT_STYLE = {
  problem_solving: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  fix_the_bug: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

export default function LabCard({ lab, isLocked }) {
  const inner = (
    <div
      className={`rounded-xl border p-4 flex items-center gap-4 transition-colors ${
        isLocked
          ? 'border-line bg-canvas opacity-60 cursor-not-allowed'
          : 'border-line bg-surface hover:border-brand-500/50 hover:shadow-sm cursor-pointer'
      }`}
    >
      <div className="flex-1 min-w-0">
        <p className={`font-medium truncate ${isLocked ? 'text-fg-subtle' : 'text-fg'}`}>
          {lab.title}
        </p>
      </div>

      <span
        className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${
          isLocked ? 'bg-raised text-fg-subtle border-line' : (FORMAT_STYLE[lab.lab_format] ?? 'bg-raised text-fg-muted border-line')
        }`}
      >
        {FORMAT_LABEL[lab.lab_format] ?? lab.lab_format}
      </span>

      {isLocked && <LockIcon />}
    </div>
  );

  if (isLocked) return inner;
  return <Link to={`/labs/${lab.id}`}>{inner}</Link>;
}
