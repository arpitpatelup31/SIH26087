import express from 'express';
import { analyzeSkillsDirect, getUserSkills, getUserRecommendations } from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze-skills', analyzeSkillsDirect);
router.get('/skills', authenticate, getUserSkills);
router.get('/recommendations', authenticate, getUserRecommendations);

export default router;
