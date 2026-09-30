import express from 'express';
import { processSyncQueue, getSyncStatus } from '../controllers/syncController.js';

const router = express.Router();

router.post('/batch', processSyncQueue);
router.get('/status', getSyncStatus);

export default router;
