import { Prisma } from '@prisma/client';

// Prisma codes meaning the database can't be reached or has no free connections
const DB_UNAVAILABLE_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024']);

// Never sends raw messages for server errors: Prisma messages include query details and the
// database host. Full details are logged instead.
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
  console.error(err);

  if (err instanceof Prisma.PrismaClientInitializationError || DB_UNAVAILABLE_CODES.has(err.code)) {
    return res.status(503).json({ error: "We're having trouble reaching the database. Please try again in a few seconds." });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Not found' });
    if (err.code === 'P2002') return res.status(400).json({ error: 'That already exists' });
    if (err.code === 'P2003') return res.status(400).json({ error: 'A related record was not found' });
  }

  const status = err.status || err.statusCode || 500;
  if (status < 500) {
    // Express/body-parser client errors (e.g. malformed JSON) mark their messages as safe to expose
    return res.status(status).json({ error: err.expose ? err.message : 'Bad request' });
  }
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
