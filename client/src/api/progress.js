import { request, authHeaders } from './request.js';

export async function getOverview() {
  const json = await request('/api/progress/overview', { headers: authHeaders(), fallbackError: 'Failed to fetch overview' });
  return json.data;
}

export async function getTopicProgress(topicId) {
  const json = await request(`/api/progress/topic/${topicId}`, { headers: authHeaders(), fallbackError: 'Failed to fetch topic progress' });
  return json.data;
}

export async function getCourseProgress(courseId) {
  const json = await request(`/api/progress/course/${courseId}`, { headers: authHeaders(), fallbackError: 'Failed to fetch course progress' });
  return json.data;
}
