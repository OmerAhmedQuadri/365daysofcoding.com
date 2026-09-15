import { PrismaClient } from '@prisma/client';

// Neon suspends idle databases, and waking one (plus the trip to its region) can take longer than
// Prisma's defaults. Allow 15 seconds to open a connection, and let queries wait 20 seconds for one:
// the pool wait must be longer than the connect timeout, or requests give up at Prisma's default
// 10 seconds while the connection is still opening. Values already set in DATABASE_URL win.
const CONNECTION_DEFAULTS = { connect_timeout: '15', pool_timeout: '20' };

function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    for (const [key, value] of Object.entries(CONNECTION_DEFAULTS)) {
      if (!url.searchParams.has(key)) url.searchParams.set(key, value);
    }
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
