import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCourse } from '../../api/courses.js';
import { createTopic, updateTopic, deleteTopic } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';

const EMPTY = { title: '', description: '', order_index: 0 };

export default function ManageTopics() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getCourse(courseId)
      .then(data => {
        setCourse(data);
        setTopics(data.topics ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(topic) {
    setEditingId(topic.id);
    setForm({ title: topic.title, description: topic.description, order_index: topic.order_index });
    setShowForm(true);
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
        const updated = await updateTopic(editingId, form);
        setTopics(prev => prev.map(t => t.id === editingId ? { ...t, ...updated } : t));
      } else {
        const created = await createTopic({ ...form, course_id: courseId });
        setTopics(prev => [...prev, { ...created, lab_count: 0 }]);
      }
      closeForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this topic and all its labs and test cases?')) return;
    try {
      await deleteTopic(id);
      setTopics(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link to="/admin/courses" className="text-xs text-indigo-600 hover:underline">← Courses</Link>
            <h1 className="text-2xl font-semibold text-gray-900 mt-1">
              {loading ? 'Topics' : `Topics: ${course?.title ?? ''}`}
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={openNew}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              + New Topic
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
              {editingId ? 'Edit Topic' : 'New Topic'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                  <input
                    value={form.title}
                    onChange={field('title')}
                    required
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                    placeholder="e.g. Variables and Types"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={field('order_index')}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <input
                  value={form.description}
                  onChange={field('description')}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"
                  placeholder="Short description"
                />
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
        ) : topics.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">No topics yet.</p>
        ) : (
          <div className="space-y-2">
            {topics.map(topic => (
              <div
                key={topic.id}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{topic.title}</p>
                  {topic.description && (
                    <p className="text-xs text-gray-400 truncate">{topic.description}</p>
                  )}
                </div>
                <span className="shrink-0 text-xs text-gray-400 tabular-nums">#{topic.order_index}</span>
                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    to={`/admin/topics/${topic.id}/labs`}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Labs →
                  </Link>
                  <button onClick={() => openEdit(topic)} className="text-xs text-gray-500 hover:text-gray-800 transition-colors">Edit</button>
                  <button onClick={() => handleDelete(topic.id)} className="text-xs text-red-500 hover:text-red-700 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
