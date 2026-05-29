import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import errorHandler from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import topicsRoutes from './routes/topics.routes.js';
import labsRoutes from './routes/labs.routes.js';
import testCasesRoutes from './routes/test-cases.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import bootcampsRoutes from './routes/bootcamps.routes.js';
import progressRoutes from './routes/progress.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/topics', topicsRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/test-cases', testCasesRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/bootcamps', bootcampsRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

if (process.env.NODE_ENV === 'production') {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const distPath = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(distPath));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

export default app;
