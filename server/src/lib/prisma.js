import { PrismaClient } from '@prisma/client';

const prisma = globalThis._prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis._prisma = prisma;
}

export default prisma;
