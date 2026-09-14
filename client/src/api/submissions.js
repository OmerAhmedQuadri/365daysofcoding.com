import { request, authHeaders } from './request.js';

export async function upsertSubmission({ lab_id, code, status, tests_passed, tests_total }) {
  const json = await request('/api/submissions', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ lab_id, code, status, tests_passed, tests_total }),
    fallbackError: 'Failed to submit',
  });
  return json.data;
}

export async function getSubmission(labId) {
  const json = await request(`/api/submissions/${labId}`, { headers: authHeaders(), fallbackError: 'Failed to fetch submission' });
  return json.data;
}
