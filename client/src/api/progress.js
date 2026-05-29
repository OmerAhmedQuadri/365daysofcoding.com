function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function getOverview() {
  const res = await fetch('/api/progress/overview', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch overview');
  return json.data;
}

export async function getTopicProgress(topicId) {
  const res = await fetch(`/api/progress/topic/${topicId}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch topic progress');
  return json.data;
}

export async function getCourseProgress(courseId) {
  const res = await fetch(`/api/progress/course/${courseId}`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch course progress');
  return json.data;
}
