import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getLab } from '../../api/labs.js';
import { getSubmission, upsertSubmission } from '../../api/submissions.js';
import { getTopic } from '../../api/topics.js';
import { runTests } from '../../utils/testRunner.js';
import Navbar from '../../components/shared/Navbar.jsx';
import ConceptPanel from '../../components/lab/ConceptPanel.jsx';
import CodeEditor from '../../components/lab/CodeEditor.jsx';
import TestResults from '../../components/lab/TestResults.jsx';

function RunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2 10a8 8 0 1 1 16 0 8 8 0 0 1-16 0Zm6.39-2.908a.75.75 0 0 1 .766.027l3.5 2.25a.75.75 0 0 1 0 1.262l-3.5 2.25A.75.75 0 0 1 8 12.25v-4.5a.75.75 0 0 1 .39-.658Z" clipRule="evenodd" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z" />
    </svg>
  );
}

export default function LabPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [lab, setLab] = useState(null);
  const [code, setCode] = useState('');
  const [results, setResults] = useState([]);
  const [running, setRunning] = useState(false);
  const [allPassed, setAllPassed] = useState(false);
  const [nextLabId, setNextLabId] = useState(null);
  const [topicId, setTopicId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let fetchedLab;
      try {
        fetchedLab = await getLab(id);
      } catch (err) {
        if (err.status === 403) {
          navigate(err.topic_id ? `/topics/${err.topic_id}` : '/');
          return;
        }
        setLoading(false);
        return;
      }

      const [submission, topic] = await Promise.all([
        getSubmission(id).catch(() => null),
        getTopic(fetchedLab.topic_id).catch(() => null),
      ]);

      if (cancelled) return;

      setLab(fetchedLab);
      setTopicId(fetchedLab.topic_id);
      setCode(submission?.code ?? fetchedLab.starter_code);

      if (topic?.labs) {
        const idx = topic.labs.findIndex(l => l.id === id);
        setNextLabId(topic.labs[idx + 1]?.id ?? null);
      }

      setLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [id, navigate]);

  const handleRun = useCallback(async () => {
    if (running || !lab) return;
    setRunning(true);
    setAllPassed(false);
    setResults([]);

    try {
      const outcome = await runTests(code, lab.test_cases, lab.lab_type);
      setResults(outcome.results);

      await upsertSubmission({
        lab_id: id,
        code,
        status: outcome.status,
        tests_passed: outcome.tests_passed,
        tests_total: outcome.tests_total,
      }).catch(() => {});

      if (outcome.status === 'passed') {
        setAllPassed(true);
      }
    } finally {
      setRunning(false);
    }
  }, [running, lab, code, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex h-[calc(100vh-64px)]">
          <div className="w-[42%] animate-pulse bg-gray-100 border-r" />
          <div className="w-[58%] animate-pulse bg-[#1e1e2e]" />
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-sm text-gray-400">Lab not found.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="min-h-screen bg-gray-50 flex flex-col"
    >
      <Navbar />

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Left — concept */}
        <div className="w-[42%] border-r border-gray-200 overflow-hidden">
          <ConceptPanel lab={lab} />
        </div>

        {/* Right — editor + results */}
        <div className="w-[58%] flex flex-col bg-[#1e1e2e] relative">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-[#313244] shrink-0">
            <div className="flex items-center gap-2">
              {topicId && (
                <Link
                  to={`/topics/${topicId}`}
                  className="text-xs text-[#6c7086] hover:text-[#cdd6f4] transition-colors mr-1"
                >
                  ← Topic
                </Link>
              )}
              <span className="text-xs text-[#6c7086]">
                {lab.lab_type === 'react' ? 'React' : 'JavaScript'}
              </span>
            </div>

            <button
              onClick={handleRun}
              disabled={running}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white transition-colors"
            >
              {running ? <Spinner /> : <RunIcon />}
              {running ? 'Running…' : 'Run Tests'}
            </button>
          </div>

          {/* Code editor */}
          <div className="flex-1 min-h-0">
            <CodeEditor value={code} onChange={setCode} />
          </div>

          {/* Test results panel */}
          <div className="h-56 overflow-y-auto bg-white border-t border-gray-200 shrink-0">
            <TestResults results={results} />
            {results.length === 0 && !running && (
              <p className="px-4 py-3 text-xs text-gray-400">
                Click <span className="font-medium text-gray-600">Run Tests</span> to check your solution.
              </p>
            )}
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {allPassed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-[#1e1e2e]/90 backdrop-blur-sm z-10"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 16 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 16 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                  className="text-center bg-[#181825] border border-[#313244] rounded-2xl px-10 py-8 shadow-xl"
                >
                  <div className="text-4xl mb-3">✓</div>
                  <p className="text-lg font-semibold text-[#a6e3a1] mb-1">All tests passing</p>
                  <p className="text-sm text-[#6c7086] mb-6">Nice work!</p>

                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => setAllPassed(false)}
                      className="px-4 py-2 rounded-lg text-sm text-[#6c7086] hover:text-[#cdd6f4] transition-colors"
                    >
                      Keep editing
                    </button>
                    <button
                      onClick={() =>
                        navigate(nextLabId ? `/labs/${nextLabId}` : `/topics/${topicId}`)
                      }
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    >
                      {nextLabId ? 'Next Lab →' : 'Back to Topic'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
