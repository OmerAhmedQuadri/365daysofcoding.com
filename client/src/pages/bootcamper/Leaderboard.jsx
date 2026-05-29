import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useBootcamp from '../../hooks/useBootcamp.js';
import { getLeaderboard } from '../../api/bootcamps.js';
import LeaderboardTable from '../../components/bootcamp/LeaderboardTable.jsx';
import Navbar from '../../components/shared/Navbar.jsx';

export default function Leaderboard() {
  const { bootcamp, loading: bootcampLoading } = useBootcamp();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!bootcamp) return;
    setLoading(true);
    getLeaderboard(bootcamp.id)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [bootcamp?.id]);

  const isLoading = bootcampLoading || loading;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <Link to="/bootcamp" className="text-sm text-indigo-600 hover:underline">
          ← Back to Bootcamp
        </Link>

        <div className="mt-4 mb-8">
          {bootcamp ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">{bootcamp.name}</h1>
              <p className="mt-1 text-sm text-gray-500">Leaderboard</p>
            </>
          ) : (
            <div className="h-8 w-48 rounded bg-gray-200 animate-pulse" />
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LeaderboardTable entries={entries} />
          </motion.div>
        )}
      </main>
    </div>
  );
}
