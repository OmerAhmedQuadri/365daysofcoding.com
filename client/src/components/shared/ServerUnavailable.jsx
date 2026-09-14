import { motion } from 'framer-motion';

// Shown by the route guards when the session can't be loaded because the server or
// database is having trouble. The saved login is kept, so "Try again" can restore it.
export default function ServerUnavailable({ message, onRetry, onSignOut }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-sm bg-surface border border-line rounded-2xl p-8 text-center"
      >
        <h1 className="text-lg font-semibold text-fg mb-2">Can&apos;t load your account</h1>
        <p className="text-sm text-fg-muted mb-6">{message}</p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onRetry}
            className="bg-brand-500 text-brand-950 rounded-lg px-4 py-2 text-sm font-medium hover:bg-brand-400 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={onSignOut}
            className="text-sm text-fg-muted hover:text-fg transition-colors"
          >
            Sign out
          </button>
        </div>
      </motion.div>
    </div>
  );
}
