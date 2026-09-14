import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

// Creates the shared "Try now" student account named by DEMO_USER_EMAIL.
// Its password is random and never shown: the Try now button signs in without one.
// Safe to re-run: an existing account is left unchanged.
const prisma = new PrismaClient();

async function main() {
  const email = process.env.DEMO_USER_EMAIL?.trim();
  if (!email) {
    throw new Error('Set DEMO_USER_EMAIL in server/.env first');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Demo user already exists: ${email} (role: ${existing.role})`);
    return;
  }

  const password_hash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);
  await prisma.user.create({
    data: { email, name: 'Demo User', password_hash, role: 'student' },
  });
  console.log(`Created demo user: ${email}`);
}

main()
  .catch((err) => { console.error(err.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
