import express from 'express';
import { getLessonById, completeLesson } from '../controllers/lessonController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, getLessonById);
router.post('/:id/complete', authenticate, completeLesson);

export default router;
