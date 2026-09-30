import express from 'express';
import { enrollInCourse, getUserCourses } from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, enrollInCourse);
router.get('/my-courses', authenticate, (req, res) => getUserCourses(req, res));

export default router;
