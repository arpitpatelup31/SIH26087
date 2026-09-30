import express from 'express';
import { getUserCertificates, getCertificateById, verifyCertificate } from '../controllers/certificateController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/my-certificates', authenticate, getUserCertificates);
router.get('/:id', authenticate, getCertificateById);
router.get('/verify/:query', verifyCertificate);

export default router;
