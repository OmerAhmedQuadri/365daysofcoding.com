import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  register,
  verifyRegistration,
  login,
  demoLogin,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/register/verify', verifyRegistration);
router.post('/login', login);
router.post('/demo', demoLogin);
router.get('/me', authenticate, me);
router.put('/password', authenticate, changePassword);
router.post('/password/forgot', forgotPassword);
router.post('/password/reset', resetPassword);

export default router;
