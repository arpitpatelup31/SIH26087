import express from 'express';
import { getQuizById, submitQuiz } from '../controllers/quizController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/:id', authenticate, getQuizById);
router.post('/:id/submit', authenticate, submitQuiz);

export default router;
