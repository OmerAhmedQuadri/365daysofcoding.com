import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import {
  getTopicProgress,
  getCourseProgress,
  getStudentOverview,
} from '../controllers/progress.controller.js';

const router = Router();

router.get('/overview', authenticate, getStudentOverview);
router.get('/topic/:topicId', authenticate, getTopicProgress);
router.get('/course/:courseId', authenticate, getCourseProgress);

export default router;
