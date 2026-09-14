import { request, authHeaders } from './request.js';

export async function getLab(id) {
  try {
    const json = await request(`/api/labs/${id}`, { headers: authHeaders(), fallbackError: 'Failed to fetch lab' });
    return json.data;
  } catch (err) {
    // A locked lab responds with the topic to send the student back to
    err.topic_id = err.body?.topic_id;
    throw err;
  }
}
