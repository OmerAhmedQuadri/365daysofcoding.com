import { Prisma } from '@prisma/client';

// Prisma codes meaning the database can't be reached or has no free connections
const DB_UNAVAILABLE_CODES = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024']);

// Never sends raw messages for server errors: Prisma messages include query details and the
// database host. Users get a generic message; the details, including that it was the database,
// go to the server log.
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, _req, res, _next) {
  if (err instanceof Prisma.PrismaClientInitializationError || DB_UNAVAILABLE_CODES.has(err.code)) {
    console.error('Database unavailable, responding 503:', err);
    return res.status(503).json({ error: 'The server is having trouble right now. Please try again in a moment.' });
  }

  console.error(err);

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
