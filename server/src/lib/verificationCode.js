import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';

// Rules for the 6-digit codes emailed for sign-up and password reset
export const CODE_TTL_MINUTES = 10;
export const RESEND_COOLDOWN_SECONDS = 60;
export const MAX_CODE_ATTEMPTS = 5;

export function inResendCooldown(record) {
  return Boolean(record) && Date.now() - record.sent_at.getTime() < RESEND_COOLDOWN_SECONDS * 1000;
}

// A fresh code, plus the columns to store for it. Only the hash is saved.
export async function newCode() {
  const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
  return {
    code,
    fields: {
      code_hash: await bcrypt.hash(code, 10),
      attempts: 0,
      expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      sent_at: new Date(),
    },
  };
}

// Checks a submitted code against its stored row (`model` is the Prisma delegate, `where` its
// unique key). Wrong guesses are counted; expired or used-up rows are deleted.
// Returns an error message, or null when the code is correct.
export async function checkCode(model, where, record, code) {
  if (!record || record.expires_at < new Date()) {
    if (record) await model.delete({ where }).catch(() => {});
    return 'This code has expired. Request a new one.';
  }
  if (record.attempts >= MAX_CODE_ATTEMPTS) {
    await model.delete({ where }).catch(() => {});
    return 'Too many incorrect attempts. Request a new code.';
  }
  if (await bcrypt.compare(code, record.code_hash)) {
    return null;
  }

  const { attempts } = await model.update({ where, data: { attempts: { increment: 1 } } });
  const left = MAX_CODE_ATTEMPTS - attempts;
  return left > 0
    ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
    : 'Too many incorrect attempts. Request a new code.';
}
