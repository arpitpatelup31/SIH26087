import { dbHelper } from '../config/db.js';
import SkillAnalysisEngine from './aiService.js';
import CertificateService from './certificateService.js';

/**
 * Offline Sync Service
 * Processes offline batches queued on edge devices / local storage when connectivity is restored.
 */
export class SyncService {
  /**
   * Process an array of sync queue actions from an edge client/Raspberry Pi
   */
  static processSyncBatch(userId, deviceId, items = []) {
    const results = [];

    dbHelper.transaction(() => {
      for (const item of items) {
        const { action, entityType, payload } = item;
        let success = true;
        let message = 'Processed';
        let syncResult = null;

        try {
          if (action === 'COMPLETE_LESSON') {
            const { lessonId, courseId } = payload;
            
            // Mark lesson complete
            dbHelper.run(`
              INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, is_completed, completed_at)
              VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
            `, [userId, lessonId, courseId]);

            // Recalculate course progress
            const totalLessons = dbHelper.get('SELECT COUNT(*) as count FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = ?', [courseId]).count;
            const completedLessons = dbHelper.get('SELECT COUNT(*) as count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1', [userId, courseId]).count;
            
            const progressPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
            const status = progressPercent >= 100 ? 'completed' : 'in_progress';
            const completedAt = status === 'completed' ? new Date().toISOString() : null;

            dbHelper.run(`
              UPDATE enrollments 
              SET progress_percent = ?, status = ?, completed_at = COALESCE(?, completed_at)
              WHERE user_id = ? AND course_id = ?
            `, [progressPercent, status, completedAt, userId, courseId]);

            syncResult = { lessonId, courseId, progressPercent, status };
          } 
          else if (action === 'SUBMIT_QUIZ') {
            const { quizId, courseId, answers, score, passed } = payload;
            
            // Insert quiz attempt
            const totalQuestions = answers.length;
            const correctAnswers = answers.filter(a => a.isCorrect).length;
            
            const attemptRes = dbHelper.run(`
              INSERT INTO quiz_attempts (user_id, quiz_id, course_id, score, total_questions, correct_answers, passed, completed_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `, [userId, quizId, courseId, score, totalQuestions, correctAnswers, passed ? 1 : 0]);

            const attemptId = attemptRes.lastInsertRowid;

            // Save individual answers
            for (const ans of answers) {
              dbHelper.run(`
                INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct, skill_id)
                VALUES (?, ?, ?, ?, ?)
              `, [attemptId, ans.questionId, ans.selectedOption, ans.isCorrect ? 1 : 0, ans.skillId]);
            }

            // Trigger AI Skill Analysis
            const skillWisePerformance = {};
            for (const ans of answers) {
              if (!skillWisePerformance[ans.skillId]) {
                const skillRow = dbHelper.get('SELECT name FROM skills WHERE id = ?', [ans.skillId]);
                skillWisePerformance[ans.skillId] = {
                  skillId: ans.skillId,
                  skill: skillRow ? skillRow.name : `Skill #${ans.skillId}`,
                  correct: 0,
                  total: 0
                };
              }
              skillWisePerformance[ans.skillId].total += 1;
              if (ans.isCorrect) skillWisePerformance[ans.skillId].correct += 1;
            }

            const assessmentPayload = Object.values(skillWisePerformance).map(s => ({
              skillId: s.skillId,
              skill: s.skill,
              score: Math.round((s.correct / s.total) * 100)
            }));

            // Sync AI Analysis
            SkillAnalysisEngine.analyzeSkills(userId, assessmentPayload);

            // If passed and progress is 100%, generate certificate
            if (passed) {
              CertificateService.generateCertificate(userId, courseId, score >= 90 ? 'A+' : score >= 75 ? 'A' : 'B');
            }

            syncResult = { attemptId, score, passed };
          }

          // Record sync queue item log
          dbHelper.run(`
            INSERT INTO sync_queue (user_id, device_id, action, entity_type, payload_json, status, synced_at)
            VALUES (?, ?, ?, ?, ?, 'synced', CURRENT_TIMESTAMP)
          `, [userId, deviceId || 'edge-client-1', action, entityType || 'general', JSON.stringify(payload)]);

        } catch (err) {
          success = false;
          message = err.message;
        }

        results.push({
          action,
          entityType,
          success,
          message,
          syncResult
        });
      }
    });

    return results;
  }
}

export default SyncService;
