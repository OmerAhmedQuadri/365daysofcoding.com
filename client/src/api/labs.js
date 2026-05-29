function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function getLab(id) {
  const res = await fetch(`/api/labs/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.error || 'Failed to fetch lab');
    err.status = res.status;
    err.topic_id = json.topic_id;
    throw err;
  }
  return json.data;
}
