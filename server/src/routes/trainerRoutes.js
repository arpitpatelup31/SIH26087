import express from 'express';
import { 
  getTrainerStats, 
  createCourse, 
  addModule, 
  addLesson, 
  createQuiz, 
  getLearnerProgress 
} from '../controllers/trainerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('trainer', 'admin'));

router.get('/stats', getTrainerStats);
router.post('/courses', createCourse);
router.post('/courses/:courseId/modules', addModule);
router.post('/modules/:moduleId/lessons', addLesson);
router.post('/courses/:courseId/quizzes', createQuiz);
router.get('/courses/:courseId/learners', getLearnerProgress);

export default router;
