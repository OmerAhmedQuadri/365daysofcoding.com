import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { getById } from '../controllers/labs.controller.js';

const router = Router();

router.get('/:id', authenticate, getById);

export default router;
