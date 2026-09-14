// The shared "Try now" account. Set DEMO_USER_EMAIL in server/.env to enable it;
// leave it empty to disable the demo. Read at call time, not import time.
export function getDemoEmail() {
  return process.env.DEMO_USER_EMAIL?.trim() || null;
}

export function isDemoUser(user) {
  const demoEmail = getDemoEmail();
  return Boolean(demoEmail && user?.email?.toLowerCase() === demoEmail.toLowerCase());
}
