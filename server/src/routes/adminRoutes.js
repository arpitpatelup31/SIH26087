import express from 'express';
import { getSystemAnalytics, getAllUsers, updateUserRole } from '../controllers/adminController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/analytics', getSystemAnalytics);
router.get('/users', getAllUsers);
router.patch('/users/:userId/role', updateUserRole);

export default router;
