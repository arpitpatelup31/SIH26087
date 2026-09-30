import express from 'express';
import { getUserCourses } from '../controllers/courseController.js';
import { getUserSkills, getUserRecommendations } from '../controllers/aiController.js';
import { getUserCertificates } from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id/courses', authenticate, getUserCourses);
router.get('/:id/skills', authenticate, getUserSkills);
router.get('/:id/recommendations', authenticate, getUserRecommendations);
router.get('/:id/certificates', authenticate, getUserCertificates);

export default router;
