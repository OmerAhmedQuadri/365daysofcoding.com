import { Router } from 'express';
import authenticate from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import {
  createBootcamp,
  createInstructor,
  createAdmin,
  addBootcampMember,
  removeBootcampMember,
  assignLabToBootcamp,
  removeBootcampLab,
  listBootcamps,
  getBootcamp,
  getStats,
  listInstructors,
  listAdmins,
  getLabAdmin,
  createCourse, updateCourse, deleteCourse,
  createTopic,  updateTopic,  deleteTopic,
  createLab,    updateLab,    deleteLab,
  createTestCase, updateTestCase, deleteTestCase,
} from '../controllers/admin.controller.js';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/stats',                              getStats);
router.get('/instructors',                        listInstructors);
router.get('/admins',                             listAdmins);

router.get('/bootcamps',                          listBootcamps);
router.get('/bootcamps/:id',                      getBootcamp);
router.post('/bootcamps',                         createBootcamp);
router.post('/instructors',                       createInstructor);
router.post('/admins',                            createAdmin);
router.post('/bootcamps/:id/members',             addBootcampMember);
router.delete('/bootcamps/:id/members/:userId',   removeBootcampMember);
router.post('/bootcamps/:id/labs',                assignLabToBootcamp);
router.delete('/bootcamps/:id/labs/:labId',       removeBootcampLab);

router.get('/labs/:id',                           getLabAdmin);
router.post('/courses',                           createCourse);
router.put('/courses/:id',                        updateCourse);
router.delete('/courses/:id',                     deleteCourse);
router.post('/topics',                            createTopic);
router.put('/topics/:id',                         updateTopic);
router.delete('/topics/:id',                      deleteTopic);
router.post('/labs',                              createLab);
router.put('/labs/:id',                           updateLab);
router.delete('/labs/:id',                        deleteLab);
router.post('/test-cases',                        createTestCase);
router.put('/test-cases/:id',                     updateTestCase);
router.delete('/test-cases/:id',                  deleteTestCase);

export default router;
