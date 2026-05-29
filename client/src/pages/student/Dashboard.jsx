import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourses } from '../../api/courses.js';
import { getOverview } from '../../api/progress.js';
import { getMyBootcamp } from '../../api/bootcamps.js';
import Navbar from '../../components/shared/Navbar.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28 } },
};

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [overview, setOverview] = useState(null);
  const [bootcamp, setBootcamp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getCourses(),
      getOverview(),
      getMyBootcamp().catch(() => null),
    ])
      .then(([cs, ov, bc]) => {
        setCourses(cs);
        setOverview(ov);
        setBootcamp(bc);
      })
      .finally(() => setLoading(false));
  }, []);

  // Build set of course IDs that have bootcamp-assigned labs
  const bootcampCourseIds = new Set(
    bootcamp?.bootcamp_labs?.map(bl => bl.lab?.topic?.course_id).filter(Boolean) ?? [],
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        {/* Bootcamp banner */}
        {bootcamp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6 flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-4"
          >
            <div>
              <p className="text-sm font-semibold text-indigo-700">{bootcamp.name}</p>
              <p className="mt-0.5 text-xs text-indigo-400">
                {bootcamp.bootcamp_labs.length} lab{bootcamp.bootcamp_labs.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
            <Link
              to="/bootcamp/leaderboard"
              className="shrink-0 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Leaderboard →
            </Link>
          </motion.div>
        )}

        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Courses</h1>
            <p className="mt-1 text-sm text-gray-500">Pick up where you left off.</p>
          </div>
          {overview !== null && (
            <span className="text-sm font-medium text-indigo-600">
              {overview.total_passed} lab{overview.total_passed !== 1 ? 's' : ''} passed
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {courses.map(course => {
              const isBootcampCourse = bootcampCourseIds.has(course.id);
              return (
                <motion.div key={course.id} variants={cardVariants}>
                  <Link
                    to={`/courses/${course.id}`}
                    className={`block rounded-xl border p-5 transition-colors ${
                      isBootcampCourse
                        ? 'border-indigo-200 bg-white hover:border-indigo-400 hover:shadow-sm'
                        : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900">{course.title}</p>
                          {isBootcampCourse && (
                            <span className="shrink-0 text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5">
                              Bootcamp
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{course.description}</p>
                      </div>
                      <span className="shrink-0 text-xs text-gray-400">
                        {course.topic_count} topic{course.topic_count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}

            {courses.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-12">No courses yet.</p>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
