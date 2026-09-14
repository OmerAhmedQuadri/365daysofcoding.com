import { PrismaClient } from '@prisma/client';

// Neon suspends idle databases, and waking one can take longer than Prisma's default
// 5-second connect timeout. Allow 15 seconds unless DATABASE_URL sets its own.
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (!url.searchParams.has('connect_timeout')) url.searchParams.set('connect_timeout', '15');
    return url.toString();
  } catch {
    return raw;
  }
}

const prisma = globalThis._prisma ?? new PrismaClient({ datasourceUrl: databaseUrl() });

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
}

export default prisma;
