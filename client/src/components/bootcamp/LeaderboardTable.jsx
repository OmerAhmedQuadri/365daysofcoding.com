import { motion } from 'framer-motion';
import useAuth from '../../hooks/useAuth.js';

function MedalIcon({ rank }) {
  const colors = { 1: 'text-yellow-400', 2: 'text-gray-400', 3: 'text-amber-600' };
  return rank <= 3
    ? <span className={`text-base ${colors[rank]}`}>{'●'}</span>
    : <span className="text-xs text-gray-400 font-mono tabular-nums">{rank}</span>;
}

export default function LeaderboardTable({ entries }) {
  const { user } = useAuth();

  if (!entries || entries.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">No students yet.</p>;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-left">
            <th className="px-4 py-3 w-12 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Labs Passed</th>
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
                className={`border-b border-gray-100 last:border-0 transition-colors ${
                  isMe ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <td className="px-4 py-3">
                  <MedalIcon rank={i + 1} />
                </td>
                <td className="px-4 py-3">
                  <span className={`font-medium ${isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                    {entry.user.name}
                  </span>
                  {isMe && (
                    <span className="ml-2 text-xs text-indigo-400">(you)</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold text-gray-800">
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
