import { request, authHeaders } from './request.js';

export async function getCourses() {
  const json = await request('/api/courses', { headers: authHeaders(), fallbackError: 'Failed to fetch courses' });
  return json.data;
}

export async function getCourse(id) {
  const json = await request(`/api/courses/${id}`, { headers: authHeaders(), fallbackError: 'Failed to fetch course' });
  return json.data;
}
