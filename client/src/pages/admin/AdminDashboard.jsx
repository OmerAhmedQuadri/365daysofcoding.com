import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAdminStats } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

const NAV_LINKS = [
  { label: 'Courses & Content', desc: 'Courses, topics, labs, test cases', to: '/admin/courses' },
  { label: 'Bootcamps',         desc: 'Create bootcamps, assign students',  to: '/admin/bootcamps' },
  { label: 'Instructors',       desc: 'Add instructor accounts',            to: '/admin/instructors' },
  { label: 'Admins',            desc: 'Add admin accounts',                 to: '/admin/admins' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-8">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Admin</p>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          >
            {[
              { label: 'Courses',   value: stats?.courses },
              { label: 'Labs',      value: stats?.labs },
              { label: 'Students',  value: stats?.students },
              { label: 'Bootcamps', value: stats?.bootcamps },
            ].map(({ label, value }) => (
              <motion.div
                key={label}
                variants={cardVariants}
                className="rounded-xl border border-gray-200 bg-white p-5"
              >
                <p className="text-2xl font-bold text-gray-900">{value ?? '–'}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Navigation */}
        <section>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Manage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NAV_LINKS.map(({ label, desc, to }) => (
              <Link
                key={to}
                to={to}
                className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-300 hover:shadow-sm transition-colors"
              >
                <p className="font-medium text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </Link>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
