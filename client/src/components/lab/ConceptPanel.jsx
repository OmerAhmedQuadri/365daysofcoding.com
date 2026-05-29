import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

const FORMAT_BADGE = {
  problem_solving: {
    label: 'Problem Solving',
    className: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  fix_the_bug: {
    label: 'Fix the Bug',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export default function ConceptPanel({ lab }) {
  const badge = FORMAT_BADGE[lab.lab_format];

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="h-full overflow-y-auto px-6 py-6 bg-white"
    >
      <div className="mb-5">
        <div className="flex items-start gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-gray-900 leading-snug">{lab.title}</h1>
          {badge && (
            <span className={`shrink-0 mt-0.5 text-xs font-medium border rounded-full px-2 py-0.5 ${badge.className}`}>
              {badge.label}
            </span>
          )}
        </div>
      </div>

      <div className="prose prose-sm prose-gray max-w-none">
        <ReactMarkdown>{lab.concept_md}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
