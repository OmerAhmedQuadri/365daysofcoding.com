import { request, authHeaders } from './request.js';

export async function getMyBootcamp() {
  const json = await request('/api/bootcamps/mine', { headers: authHeaders(), fallbackError: 'Failed to fetch bootcamp' });
  return json.data;
}

export async function getStudentProgress(bootcampId) {
  const json = await request(`/api/bootcamps/${bootcampId}/students`, { headers: authHeaders(), fallbackError: 'Failed to fetch student progress' });
  return json.data;
}

export async function getLeaderboard(bootcampId) {
  const json = await request(`/api/bootcamps/${bootcampId}/leaderboard`, { headers: authHeaders(), fallbackError: 'Failed to fetch leaderboard' });
  return json.data;
}
