import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth.js';

function MedalIcon({ rank }) {
  const colors = { 1: 'text-yellow-400', 2: 'text-fg-subtle', 3: 'text-amber-400' };
  return rank <= 3
    ? <span className={`text-base ${colors[rank]}`}>{'●'}</span>
    : <span className="text-xs text-fg-subtle font-mono tabular-nums">{rank}</span>;
}

export default function LeaderboardTable({ entries }) {
  const { user } = useAuth();

  if (!entries || entries.length === 0) {
    return <p className="text-sm text-fg-subtle text-center py-8">No students yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-canvas text-left">
            <th className="px-4 py-3 w-12 text-xs font-semibold text-fg-muted uppercase tracking-wide">#</th>
            <th className="px-4 py-3 text-xs font-semibold text-fg-muted uppercase tracking-wide">Student</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-fg-muted uppercase tracking-wide">Labs Passed</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const isMe = entry.user.id === user?.id;
            return (
              <motion.tr
                key={entry.user.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.06 }}
                className={`border-b border-line last:border-0 transition-colors ${
                  isMe ? 'bg-brand-500/10' : 'bg-surface hover:bg-raised'
                }`}
              >
                <td className="px-4 py-3">
                  <MedalIcon rank={i + 1} />
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${isMe ? 'text-brand-300' : 'text-fg'}`}>
                    {entry.user.name}
                  </span>
                  {isMe && (
                    <span className="ml-2 text-xs text-brand-400">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-fg">
                  {entry.labs_passed}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
