import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { getMyBootcamp, getLeaderboard, getStudentProgress } from '../controllers/bootcamps.controller.js';

const router = Router();

router.get('/mine',              authenticate, getMyBootcamp);
router.get('/:id/leaderboard',  authenticate, getLeaderboard);
router.get('/:id/students',     authenticate, requireRole('instructor', 'admin'), getStudentProgress);

export default router;
