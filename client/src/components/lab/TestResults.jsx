import { motion } from 'framer-motion';

function PassIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-green-400">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
  );
}

function FailIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-red-400">
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
    </svg>
  );
}

export default function TestResults({ results }) {
  if (!results || results.length === 0) return null;

  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  const allPassed = passed === total;

  return (
    <div className="px-4 py-3">
      <p className={`text-xs font-semibold mb-2 ${allPassed ? 'text-green-400' : 'text-fg-muted'}`}>
        {passed}/{total} tests passing
      </p>

      <div className="space-y-1.5">
        {results.map((result, i) => (
          <motion.div
            key={result.id ?? i}
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 26, delay: i * 0.05 }}
            className={`flex items-start gap-2.5 rounded-lg px-3 py-2 text-sm ${
              result.passed
                ? 'bg-green-500/10 text-green-300'
                : 'bg-red-500/10 text-red-300'
            }`}
          >
            {result.passed ? <PassIcon /> : <FailIcon />}
            <div className="min-w-0">
              <p className="font-medium leading-snug">{result.description}</p>
              {!result.passed && result.error && (
                <p className="mt-0.5 text-xs text-red-400 font-mono break-all">{result.error}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
