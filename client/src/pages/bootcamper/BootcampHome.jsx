import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useBootcamp from '../../hooks/useBootcamp.js';
import Navbar from '../../components/shared/Navbar.jsx';

const FORMAT_LABEL = { problem_solving: 'Problem Solving', fix_the_bug: 'Fix the Bug' };
const FORMAT_STYLE = {
  problem_solving: 'bg-blue-50 text-blue-700 border-blue-200',
  fix_the_bug: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function BootcampHome() {
  const { bootcamp, loading } = useBootcamp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !bootcamp ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">You are not a member of any bootcamp.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-indigo-600 hover:underline">
              ← Back to courses
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                  Bootcamp
                </p>
                <h1 className="text-2xl font-semibold text-gray-900">{bootcamp.name}</h1>
                {bootcamp.description && (
                  <p className="mt-1 text-sm text-gray-500">{bootcamp.description}</p>
                )}
              </div>
              <Link
                to="/bootcamp/leaderboard"
                className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                Leaderboard →
              </Link>
            </div>

            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Assigned Labs
                <span className="ml-2 text-gray-400 font-normal">
                  {bootcamp.bootcamp_labs.length}
                </span>
              </h2>

              <motion.div
                className="space-y-2"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.06 } } }}
              >
                {bootcamp.bootcamp_labs.map(bl => (
                  <motion.div
                    key={bl.lab_id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                    }}
                  >
                    <Link
                      to={`/labs/${bl.lab.id}`}
                      className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-indigo-300 hover:shadow-sm transition-colors"
                    >
                      <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 truncate">
                        {bl.lab.title}
                      </span>
                      <span className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${FORMAT_STYLE[bl.lab.lab_format] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {FORMAT_LABEL[bl.lab.lab_format] ?? bl.lab.lab_format}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {bootcamp.bootcamp_labs.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-8">
                    No labs assigned yet.
                  </p>
                )}
              </motion.div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
