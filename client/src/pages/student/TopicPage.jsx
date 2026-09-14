import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopic } from '../../api/topics.js';
import LabCard from '../../components/shared/LabCard.jsx';
import Navbar from '../../components/shared/Navbar.jsx';

export default function TopicPage() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopic(id)
      .then(setTopic)
      .finally(() => setLoading(false));
  }, [id]);

  const passedCount = topic?.completion?.passed ?? 0;

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {topic?.course_id ? (
          <Link
            to={`/courses/${topic.course_id}`}
            className="text-sm text-brand-400 hover:underline"
          >
            ← Back to course
          </Link>
        ) : (
          <Link to="/" className="text-sm text-brand-400 hover:underline">
            ← All courses
          </Link>
        )}

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-line animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-4 mb-8">
              <h1 className="text-2xl font-semibold text-fg">{topic?.title}</h1>
              {topic?.description && (
                <p className="mt-1 text-sm text-fg-muted">{topic.description}</p>
              )}
              {topic?.completion && (
                <p className="mt-2 text-sm text-fg-subtle">
                  {topic.completion.passed} of {topic.completion.total} labs passed
                </p>
              )}
            </div>

            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
              {topic?.labs.map(lab => {
                const isLocked = lab.order_index > passedCount + 1;
                return (
                  <motion.div
                    key={lab.id}
                    variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.22 } } }}
                  >
                    <LabCard lab={lab} isLocked={isLocked} />
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
