import { request, authHeaders } from './request.js';

export async function getTopic(id) {
  const json = await request(`/api/topics/${id}`, { headers: authHeaders(), fallbackError: 'Failed to fetch topic' });
  return json.data;
}
