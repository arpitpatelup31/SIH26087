import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initializeDatabase } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import userRoutes from './routes/userRoutes.js';
import trainerRoutes from './routes/trainerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import syncRoutes from './routes/syncRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize SQLite schema
initializeDatabase();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'CoopConnect LMS Backend & AI Engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// --- Production: Serve React frontend ---
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA catch-all: any non-API route serves index.html
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

app.listen(PORT, () => {
  console.log(`🚀 CoopConnect LMS API Server running on port ${PORT} [http://localhost:${PORT}]`);
});
