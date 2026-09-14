import bcrypt from 'bcrypt';
import prisma from '../lib/prisma.js';
import { sign } from '../lib/jwt.js';
import { getDemoEmail, isDemoUser } from '../lib/demo.js';

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password_hash, role: 'student' },
    });

    const token = sign({ id: user.id, email: user.email, role: user.role });

    res.status(201).json({
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
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

    const token = sign({ id: user.id, email: user.email, role: user.role });

    res.json({
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
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

    const token = sign({ id: user.id, email: user.email, role: user.role });

    res.json({
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
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
