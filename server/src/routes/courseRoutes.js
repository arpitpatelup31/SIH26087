import express from 'express';
import { getCourses, getCourseById } from '../controllers/courseController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Optional authentication to include user's enrollment status
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authenticate(req, res, next);
  }
  next();
};

router.get('/', optionalAuth, getCourses);
router.get('/:id', optionalAuth, getCourseById);

export default router;
