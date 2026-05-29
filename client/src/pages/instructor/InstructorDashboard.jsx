import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMyBootcamp } from '../../api/bootcamps.js';
import { getStudentProgress } from '../../api/bootcamps.js';
import Navbar from '../../components/shared/Navbar.jsx';
import StudentCard from '../../components/bootcamp/StudentCard.jsx';

export default function InstructorDashboard() {
  const [bootcamp, setBootcamp] = useState(null);
  const [students, setStudents] = useState([]);
  const [totalLabs, setTotalLabs] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyBootcamp()
      .then(bc => {
        setBootcamp(bc);
        return getStudentProgress(bc.id);
      })
      .then(data => {
        setStudents(data);
        if (data.length > 0) setTotalLabs(data[0].progress.length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : !bootcamp ? (
          <div className="text-center py-16">
            <p className="text-sm text-gray-400">You are not assigned to any bootcamp.</p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">
                Instructor Dashboard
              </p>
              <h1 className="text-2xl font-semibold text-gray-900">{bootcamp.name}</h1>
              {bootcamp.description && (
                <p className="mt-1 text-sm text-gray-500">{bootcamp.description}</p>
              )}
            </div>

            <section>
              <h2 className="text-sm font-semibold text-gray-700 mb-3">
                Students
                <span className="ml-2 text-gray-400 font-normal">{students.length}</span>
              </h2>

              {students.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No students enrolled yet.</p>
              ) : (
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="show"
                  variants={{ show: { transition: { staggerChildren: 0.07 } } }}
                >
                  {students.map(student => {
                    const labs_passed = student.progress.filter(p => p.status === 'passed').length;
                    return (
                      <motion.div
                        key={student.user.id}
                        variants={{
                          hidden: { opacity: 0, y: 8 },
                          show: { opacity: 1, y: 0, transition: { duration: 0.2 } },
                        }}
                      >
                        <Link
                          to={`/instructor/students/${student.user.id}`}
                          className="block hover:shadow-sm transition-shadow rounded-xl"
                        >
                          <StudentCard
                            entry={{ user: student.user, labs_passed }}
                            totalLabs={totalLabs}
                          />
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
