function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function upsertSubmission({ lab_id, code, status, tests_passed, tests_total }) {
  const res = await fetch('/api/submissions', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab_id, code, status, tests_passed, tests_total }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to submit');
  return json.data;
}

export async function getSubmission(labId) {
  const res = await fetch(`/api/submissions/${labId}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch submission');
  return json.data;
}
