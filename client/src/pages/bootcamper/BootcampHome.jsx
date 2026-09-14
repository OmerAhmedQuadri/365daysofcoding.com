import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import useBootcamp from '../../hooks/useBootcamp.js';
import Navbar from '../../components/shared/Navbar.jsx';

const FORMAT_LABEL = { problem_solving: 'Problem Solving', fix_the_bug: 'Fix the Bug' };
const FORMAT_STYLE = {
  problem_solving: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
  fix_the_bug: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
};

export default function BootcampHome() {
  const { bootcamp, loading } = useBootcamp();

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-line animate-pulse" />
            ))}
          </div>
        ) : !bootcamp ? (
          <div className="text-center py-16">
            <p className="text-sm text-fg-subtle">You are not a member of any bootcamp.</p>
            <Link to="/" className="mt-4 inline-block text-sm text-brand-400 hover:underline">
              ← Back to courses
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold text-brand-400 uppercase tracking-wide mb-1">
                  Bootcamp
                </p>
                <h1 className="text-2xl font-semibold text-fg">{bootcamp.name}</h1>
                {bootcamp.description && (
                  <p className="mt-1 text-sm text-fg-muted">{bootcamp.description}</p>
                )}
              </div>
              <Link
                to="/bootcamp/leaderboard"
                className="shrink-0 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                Leaderboard →
              </Link>
            </div>

            <section>
              <h2 className="text-sm font-semibold text-fg-muted mb-3">
                Assigned Labs
                <span className="ml-2 text-fg-subtle font-normal">
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
                      className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3 hover:border-brand-500/50 hover:shadow-sm transition-colors"
                    >
                      <span className="flex-1 min-w-0 text-sm font-medium text-fg truncate">
                        {bl.lab.title}
                      </span>
                      <span className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${FORMAT_STYLE[bl.lab.lab_format] ?? 'bg-raised text-fg-muted border-line'}`}>
                        {FORMAT_LABEL[bl.lab.lab_format] ?? bl.lab.lab_format}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {bootcamp.bootcamp_labs.length === 0 && (
                  <p className="text-sm text-fg-subtle text-center py-8">
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
