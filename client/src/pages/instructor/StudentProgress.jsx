import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyBootcamp, getStudentProgress } from '../../api/bootcamps.js';
import Navbar from '../../components/shared/Navbar.jsx';
import ProgressBar from '../../components/shared/ProgressBar.jsx';

const STATUS_STYLE = {
  passed: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

const STATUS_LABEL = {
  passed: 'Passed',
  failed: 'Failed',
};

function groupByTopic(progress) {
  const map = new Map();
  for (const item of progress) {
    if (!map.has(item.topic_id)) {
      map.set(item.topic_id, { topic_id: item.topic_id, topic_title: item.topic_title, labs: [] });
    }
    map.get(item.topic_id).labs.push(item);
  }
  return Array.from(map.values());
}

export default function StudentProgress() {
  const { userId } = useParams();
  const [student, setStudent] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBootcamp()
      .then(bc => getStudentProgress(bc.id))
      .then(data => {
        const found = data.find(s => s.user.id === userId);
        if (found) {
          setStudent(found.user);
          setTopics(groupByTopic(found.progress));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-10">

        <Link to="/instructor" className="text-sm text-indigo-600 hover:underline">
          ← Back to Dashboard
        </Link>

        <div className="mt-4 mb-8">
          {loading ? (
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-gray-200 animate-pulse" />
              <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
            </div>
          ) : student ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">{student.name}</h1>
              <p className="mt-0.5 text-sm text-gray-400">{student.email}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">Student not found.</p>
          )}
        </div>

        {!loading && topics.length > 0 && (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          >
            {topics.map(topic => {
              const passed = topic.labs.filter(l => l.status === 'passed').length;
              const total = topic.labs.length;
              const pct = total > 0 ? Math.round((passed / total) * 100) : 0;

              return (
                <motion.div
                  key={topic.topic_id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.22 } },
                  }}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden"
                >
                  {/* Topic header */}
                  <div className="px-5 pt-4 pb-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">{topic.topic_title}</p>
                      <span className="text-xs text-gray-400 tabular-nums">
                        {passed}/{total} passed
                      </span>
                    </div>
                    <ProgressBar value={pct} />
                  </div>

                  {/* Labs list */}
                  <ul className="divide-y divide-gray-100">
                    {topic.labs.map((lab, i) => (
                      <motion.li
                        key={lab.lab_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.18, delay: i * 0.04 }}
                        className="flex items-center justify-between px-5 py-2.5"
                      >
                        <span className="text-sm text-gray-700 truncate mr-3">{lab.lab_title}</span>
                        {lab.status ? (
                          <span
                            className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${STATUS_STYLE[lab.status]}`}
                          >
                            {STATUS_LABEL[lab.status]}
                          </span>
                        ) : (
                          <span className="shrink-0 text-xs text-gray-400">Not attempted</span>
                        )}
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {!loading && topics.length === 0 && student && (
          <p className="text-sm text-gray-400 text-center py-10">No labs assigned to this bootcamp yet.</p>
        )}
      </main>
    </div>
  );
}
