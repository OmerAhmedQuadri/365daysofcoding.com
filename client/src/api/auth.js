import { request, authHeaders } from './request.js';

const BASE = '/api/auth';

// Sign-up step 1: emails a verification code; the account is created by verifyRegistration
export async function register(data) {
  const json = await request(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    fallbackError: 'Registration failed',
  });
  return json.message;
}

export async function verifyRegistration({ email, code }) {
  const json = await request(`${BASE}/register/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
    fallbackError: 'Verification failed',
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

// Forgot password step 1: emails a reset code if the account exists (the reply is the same either way)
export async function requestPasswordReset(email) {
  const json = await request(`${BASE}/password/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
    fallbackError: 'Could not send the reset code',
  });
  return json.message;
}

// Forgot password step 2: returns { token, user } so the user is signed in straight away
export async function resetPassword({ email, code, new_password }) {
  const json = await request(`${BASE}/password/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, new_password }),
    fallbackError: 'Could not reset password',
  });
  return json.data;
}

export async function changePassword({ current_password, new_password }) {
  const json = await request(`${BASE}/password`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ current_password, new_password }),
    fallbackError: 'Could not update password',
  });
  return json.message;
}
