import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { getAll, getById } from '../controllers/courses.controller.js';

const router = Router();

router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getById);

export default router;
