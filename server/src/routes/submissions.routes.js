import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { upsert, getByLab } from '../controllers/submissions.controller.js';

const router = Router();

router.post('/', authenticate, upsert);
router.get('/:labId', authenticate, getByLab);

export default router;
