function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function getCourses() {
  const res = await fetch('/api/courses', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch courses');
  return json.data;
}

export async function getCourse(id) {
  const res = await fetch(`/api/courses/${id}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch course');
  return json.data;
}
