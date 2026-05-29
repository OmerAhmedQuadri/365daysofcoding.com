function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('token')}` };
}

export async function getMyBootcamp() {
  const res = await fetch('/api/bootcamps/mine', { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) {
    const err = new Error(json.error || 'Failed to fetch bootcamp');
    err.status = res.status;
    throw err;
  }
  return json.data;
}

export async function getStudentProgress(bootcampId) {
  const res = await fetch(`/api/bootcamps/${bootcampId}/students`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch student progress');
  return json.data;
}

export async function getLeaderboard(bootcampId) {
  const res = await fetch(`/api/bootcamps/${bootcampId}/leaderboard`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Failed to fetch leaderboard');
  return json.data;
}
