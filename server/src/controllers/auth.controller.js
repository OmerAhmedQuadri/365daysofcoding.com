import bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import prisma from '../lib/prisma.js';
import { sign } from '../lib/jwt.js';
import { getDemoEmail, isDemoUser } from '../lib/demo.js';
import { sendVerificationCode } from '../lib/mailer.js';

const MIN_PASSWORD_LENGTH = 8;
const CODE_TTL_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_CODE_ATTEMPTS = 5;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function authResponse(user) {
  return {
    token: sign({ id: user.id, email: user.email, role: user.role }),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

// Sign-up step 1: save the details and email a 6-digit code. The account itself is created in
// verifyRegistration, so an unverified sign-up never claims the email address.
export async function register(req, res, next) {
  try {
    const name = text(req.body.name);
    const email = text(req.body.email);
    const { password } = req.body;
    if (!name || !email || typeof password !== 'string' || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (pending && Date.now() - pending.sent_at.getTime() < RESEND_COOLDOWN_SECONDS * 1000) {
      return res.status(429).json({ error: 'Please wait a minute before requesting another code' });
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    const [password_hash, code_hash] = await Promise.all([bcrypt.hash(password, 10), bcrypt.hash(code, 10)]);
    const fields = {
      name,
      password_hash,
      code_hash,
      attempts: 0,
      expires_at: new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000),
      sent_at: new Date(),
    };
    await prisma.pendingRegistration.upsert({ where: { email }, update: fields, create: { email, ...fields } });

    try {
      await sendVerificationCode({ to: email, name, code, expiresInMinutes: CODE_TTL_MINUTES });
    } catch (err) {
      // Remove the row so the person can retry straight away instead of waiting out the cooldown
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      console.error('Failed to send verification email:', err);
      return res.status(503).json({ error: "We couldn't send the verification email. Please try again later." });
    }

    res.json({ message: 'Verification code sent' });
  } catch (err) {
    next(err);
  }
}

// Sign-up step 2: check the emailed code, then create the student and sign them in.
export async function verifyRegistration(req, res, next) {
  try {
    const email = text(req.body.email);
    const code = text(req.body.code);
    if (!email || !code) {
      return res.status(400).json({ error: 'email and code are required' });
    }

    const pending = await prisma.pendingRegistration.findUnique({ where: { email } });
    if (!pending || pending.expires_at < new Date()) {
      if (pending) await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return res.status(400).json({ error: 'This code has expired. Request a new one.' });
    }
    if (pending.attempts >= MAX_CODE_ATTEMPTS) {
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return res.status(400).json({ error: 'Too many incorrect attempts. Request a new code.' });
    }

    const valid = await bcrypt.compare(code, pending.code_hash);
    if (!valid) {
      const { attempts } = await prisma.pendingRegistration.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      const left = MAX_CODE_ATTEMPTS - attempts;
      return res.status(400).json({
        error: left > 0
          ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.`
          : 'Too many incorrect attempts. Request a new code.',
      });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      await prisma.pendingRegistration.delete({ where: { email } }).catch(() => {});
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { name: pending.name, email, password_hash: pending.password_hash, role: 'student' },
      });
      await tx.pendingRegistration.delete({ where: { email } });
      return created;
    });

    res.status(201).json({ data: authResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ data: authResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function demoLogin(req, res, next) {
  try {
    const email = getDemoEmail();
    const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

    // Only ever hand out a student account, even if DEMO_USER_EMAIL points elsewhere
    if (!user || user.role !== 'student') {
      return res.status(404).json({ error: 'Demo account is not available' });
    }

    res.json({ data: authResponse(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, role: true, created_at: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ data: { ...user, is_demo: isDemoUser(user) } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req, res, next) {
  try {
    if (isDemoUser(req.user)) {
      return res.status(403).json({ error: "The demo account's password can't be changed" });
    }

    const { current_password, new_password } = req.body;
    if (typeof current_password !== 'string' || typeof new_password !== 'string' || !current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required' });
    }
    if (new_password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ error: `New password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (!(await bcrypt.compare(current_password, user.password_hash))) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }
    if (current_password === new_password) {
      return res.status(400).json({ error: 'New password must be different from the current one' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: await bcrypt.hash(new_password, 10) },
    });

    res.json({ message: 'Password updated' });
  } catch (err) {
    next(err);
  }
}
