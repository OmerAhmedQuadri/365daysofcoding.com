import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getLabAdmin, createTestCase, updateTestCase, deleteTestCase } from '../../api/admin.js';
import Navbar from '../../components/shared/Navbar.jsx';
import CodeEditor from '../../components/lab/CodeEditor.jsx';

const EMPTY_FORM = { description: '', test_code: '', order_index: 0 };

export default function ManageTestCases() {
  const { labId } = useParams();
  const [lab, setLab] = useState(null);
  const [testCases, setTestCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formKey, setFormKey] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getLabAdmin(labId)
      .then(data => {
        setLab(data);
        setTestCases(data.test_cases ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [labId]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormKey(k => k + 1);
    setShowForm(true);
  }

  function openEdit(tc) {
    setEditingId(tc.id);
    setForm({ description: tc.description, test_code: tc.test_code, order_index: tc.order_index });
    setFormKey(k => k + 1);
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
        const updated = await updateTestCase(editingId, form);
        setTestCases(prev => prev.map(tc => tc.id === editingId ? { ...tc, ...updated } : tc));
      } else {
        const created = await createTestCase({ ...form, lab_id: labId });
        setTestCases(prev => [...prev, created]);
      }
      closeForm();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this test case?')) return;
    try {
      await deleteTestCase(id);
      setTestCases(prev => prev.filter(tc => tc.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">

        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link
              to={lab ? `/admin/topics/${lab.topic_id}/labs` : '/admin/courses'}
              className="text-xs text-brand-400 hover:underline"
            >
              ← Labs
            </Link>
            <h1 className="text-2xl font-semibold text-fg mt-1">
              {loading ? 'Test Cases' : `Test Cases: ${lab?.title ?? ''}`}
            </h1>
          </div>
          {!showForm && (
            <button
              onClick={openNew}
              className="px-3 py-1.5 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 text-brand-950 transition-colors"
            >
              + New Test Case
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
            className="mb-6 rounded-xl border border-brand-500/30 bg-surface p-5"
          >
            <h2 className="text-sm font-semibold text-fg mb-4">
              {editingId ? 'Edit Test Case' : 'New Test Case'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-fg-muted mb-1">Description</label>
                  <input
                    value={form.description}
                    onChange={field('description')}
                    required
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                    placeholder="e.g. Returns the correct sum"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-fg-muted mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order_index}
                    onChange={field('order_index')}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-fg-muted mb-1">Test Code</label>
                <div className="h-40 rounded-lg overflow-hidden border border-line">
                  <CodeEditor
                    key={`test-${formKey}`}
                    value={form.test_code}
                    onChange={v => setForm(f => ({ ...f, test_code: v }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-500 hover:bg-brand-400 disabled:opacity-60 text-brand-950 transition-colors"
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 rounded-lg text-sm text-fg-muted hover:text-fg transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* List */}
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <div key={i} className="h-14 rounded-xl bg-line animate-pulse" />)}
          </div>
        ) : testCases.length === 0 ? (
          <p className="text-sm text-fg-subtle text-center py-10">No test cases yet.</p>
        ) : (
          <div className="space-y-2">
            {testCases.map(tc => (
              <div
                key={tc.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fg truncate">{tc.description}</p>
                  <p className="text-xs text-fg-subtle font-mono truncate mt-0.5">{tc.test_code}</p>
                </div>
                <span className="shrink-0 text-xs text-fg-subtle tabular-nums">#{tc.order_index}</span>
                <div className="shrink-0 flex items-center gap-2">
                  <button onClick={() => openEdit(tc)} className="text-xs text-fg-muted hover:text-fg transition-colors">Edit</button>
                  <button onClick={() => handleDelete(tc.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
