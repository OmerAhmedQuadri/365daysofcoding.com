// Shared fetch wrapper for every API module. Turns network failures and empty or non-JSON
// responses (server down, proxy or nginx error pages) into readable messages, and sets
// err.status so callers can tell auth failures from outages.
const UNREACHABLE = "Can't reach the server right now. Please try again in a moment.";

export function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

function apiError(message, status, body) {
  const err = new Error(message);
  err.status = status;
  err.body = body;
  return err;
}

export async function request(url, { fallbackError = 'Something went wrong', ...options } = {}) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    throw apiError(UNREACHABLE, 0, null);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    // Empty or non-JSON body: handled below
  }

  if (!res.ok) {
    const message = json?.error || (res.status >= 500 ? UNREACHABLE : fallbackError);
    throw apiError(message, res.status, json);
  }
  if (json === null) {
    throw apiError(UNREACHABLE, res.status, null);
  }
  return json;
}
