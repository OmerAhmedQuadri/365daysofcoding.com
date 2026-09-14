import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourse } from '../../api/courses.js';
import { getCourseProgress } from '../../api/progress.js';
import TopicCard from '../../components/shared/TopicCard.jsx';
import Navbar from '../../components/shared/Navbar.jsx';

export default function CoursePage() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCourse(id), getCourseProgress(id)])
      .then(([c, progress]) => {
        const progressMap = new Map(progress.map(p => [p.id, p]));
        const enriched = c.topics.map((t, idx) => ({
          ...t,
          ...(progressMap.get(t.id) ?? { total_labs: t.lab_count, passed_labs: 0, is_complete: false }),
          isLocked: idx > 0 && !progressMap.get(c.topics[idx - 1].id)?.is_complete,
        }));
        setCourse(c);
        setTopics(enriched);
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <Link to="/" className="text-sm text-brand-400 hover:underline">
          ← All courses
        </Link>

        {loading ? (
          <div className="mt-6 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 rounded-xl bg-line animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-4 mb-8">
              <h1 className="text-2xl font-semibold text-fg">{course?.title}</h1>
              {course?.description && (
                <p className="mt-1 text-sm text-fg-muted">{course.description}</p>
              )}
            </div>

            <motion.div
              className="space-y-3"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
            >
              {topics.map(topic => (
                <motion.div
                  key={topic.id}
                  variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } }}
                >
                  <TopicCard topic={topic} isLocked={topic.isLocked} />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
