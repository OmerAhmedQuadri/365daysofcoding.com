import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTopic } from '../../api/topics.js';
import { getLabAdmin, createLab, updateLab, deleteLab } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';
import CodeEditor from '../../components/lab/CodeEditor.jsx';

const EMPTY_FORM = {
  title: '',
  concept_md: '',
  starter_code: '',
  solution_code: '',
  lab_type: 'javascript',
  lab_format: 'problem_solving',
  order_index: 0,
};

const FORMAT_LABEL = { problem_solving: 'Problem Solving', fix_the_bug: 'Fix the Bug' };
const TYPE_LABEL   = { javascript: 'JS', react: 'React' };

const FORMAT_STYLE = {
  problem_solving: 'bg-blue-50 text-blue-700 border-blue-200',
  fix_the_bug:     'bg-amber-50 text-amber-700 border-amber-200',
};

export default function ManageLabs() {
  const { topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getTopic(topicId)
      .then(data => {
        setTopic(data);
        setLabs(data.labs ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicId]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormKey(k => k + 1);
    setShowForm(true);
  }

  async function openEdit(lab) {
    try {
      const full = await getLabAdmin(lab.id);
      setEditingId(full.id);
      setForm({
        title:         full.title,
        concept_md:    full.concept_md,
        starter_code:  full.starter_code,
        solution_code: full.solution_code,
        lab_type:      full.lab_type,
        lab_format:    full.lab_format,
        order_index:   full.order_index,
      });
      setFormKey(k => k + 1);
      setShowForm(true);
    } catch (err) {
      alert(err.message);
    }
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
  }

  function field(key) {
    return (e) => setForm(f => ({ ...f, [key]: key === 'order_index' ? Number(e.target.value) : e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const updated = await updateLab(editingId, form);
        setLabs(prev => prev.map(l => l.id === editingId ? { ...l, ...updated } : l));
      } else {
        const created = await createLab({ ...form, topic_id: topicId });
        setLabs(prev => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this lab and all its test cases and submissions?')) return;
    try {
      await deleteLab(id);
      setLabs(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to={topic ? `/admin/courses/${topic.course_id}/topics` : '/admin/courses'}
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Topics
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">
              {loading ? 'Labs' : `Labs: ${topic?.title ?? ''}`}
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={openNew}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              + New Lab
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 rounded-xl border border-indigo-200 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-gray-800 mb-4">
              {editingId ? 'Edit Lab' : 'New Lab'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: title + type + format + order */}
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={field('title')}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="Lab title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                  <select
                    value={form.lab_type}
                    onChange={field('lab_type')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="react">React</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Format</label>
                  <select
                    value={form.lab_format}
                    onChange={field('lab_format')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  >
                    <option value="problem_solving">Problem Solving</option>
                    <option value="fix_the_bug">Fix the Bug</option>
                  </select>
                </div>
              </div>

              {/* Row 2: order_index */}
              <div className="w-24">
                <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                <input
                  type="number"
                  value={form.order_index}
                  onChange={field('order_index')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>

              {/* Concept MD */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Concept (Markdown)</label>
                <textarea
                  value={form.concept_md}
                  onChange={field('concept_md')}
                  rows={6}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono focus:outline-none focus:border-indigo-400 resize-y"
                  placeholder="## Title&#10;&#10;Explain the concept here..."
                />
              </div>

              {/* Starter Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Starter Code</label>
                <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                  <CodeEditor
                    key={`starter-${formKey}`}
                    value={form.starter_code}
                    onChange={v => setForm(f => ({ ...f, starter_code: v }))}
                  />
                </div>
              </div>

              {/* Solution Code */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Solution Code</label>
                <div className="h-48 rounded-lg overflow-hidden border border-gray-200">
                  <CodeEditor
                    key={`solution-${formKey}`}
                    value={form.solution_code}
                    onChange={v => setForm(f => ({ ...f, solution_code: v }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-gray-200 animate-pulse" />)}
          </div>
        ) : labs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No labs yet.</p>
        ) : (
          <div className="space-y-2">
            {labs.map(lab => (
              <div
                key={lab.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{lab.title}</p>
                </div>
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">#{lab.order_index}</span>
                <span className="shrink-0 text-xs text-gray-500 font-medium">{TYPE_LABEL[lab.lab_type]}</span>
                <span className={`shrink-0 text-xs font-medium border rounded-full px-2 py-0.5 ${FORMAT_STYLE[lab.lab_format] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                  {FORMAT_LABEL[lab.lab_format] ?? lab.lab_format}
                </span>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to={`/admin/labs/${lab.id}/test-cases`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Tests →
                  </Link>
                  <button onClick={() => openEdit(lab)} className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(lab.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
