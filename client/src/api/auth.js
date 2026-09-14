import { request } from './request.js';

const BASE = '/api/auth';

export async function register(data) {
  const json = await request(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    fallbackError: 'Registration failed',
  });
  return json.data;
}

export async function login(data) {
  const json = await request(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    fallbackError: 'Login failed',
  });
  return json.data;
}

export async function demoLogin() {
  const json = await request(`${BASE}/demo`, { method: 'POST', fallbackError: 'Could not start the demo' });
  return json.data;
}

export async function getMe(token) {
  const json = await request(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
    fallbackError: 'Failed to fetch user',
  });
  return json.data;
}
