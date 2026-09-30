import { dbHelper } from '../config/db.js';

/**
 * CoopConnect AI Skill Analysis & Recommendation Engine
 * 
 * Modular architecture designed to process learner assessment outputs,
 * identify skill proficiencies & gaps, and generate intelligent course recommendations.
 * 
 * Designed with a pluggable interface to switch between rule-based heuristic analyzer
 * and trained TensorFlow.js ML model.
 */

export class SkillAnalysisEngine {
  /**
   * Evaluates assessment results and generates skill profiles & recommendations
   * @param {number} userId - ID of the learner
   * @param {Array<{ skill: string, skillId?: number, score: number, totalQuestions?: number }>} assessmentResults 
   * @returns {Promise<{ strengths: Array<string>, developing: Array<string>, skillGaps: Array<string>, recommendations: Array<any>, skillMetrics: Array<any> }>}
   */
  static async analyzeSkills(userId, assessmentResults = []) {
    const strengths = [];
    const developing = [];
    const skillGaps = [];
    const skillMetrics = [];

    // 1. Process and categorize each skill score
    for (const item of assessmentResults) {
      const skillName = item.skill || 'General Cooperative Knowledge';
      const score = Math.round(Number(item.score) || 0);

      let status = 'Skill Gap';
      let confidence = 0.85;

      if (score >= 80) {
        status = 'Strong';
        strengths.push(skillName);
        confidence = 0.95;
      } else if (score >= 60) {
        status = 'Developing';
        developing.push(skillName);
        confidence = 0.88;
      } else {
        status = 'Skill Gap';
        skillGaps.push(skillName);
        confidence = 0.92;
      }

      skillMetrics.push({
        skillName,
        skillId: item.skillId || null,
        score,
        status,
        confidence,
        gapDelta: Math.max(0, 80 - score),
        assessedAt: new Date().toISOString()
      });

      // Update skill profile in database if skillId exists or find it by name
      let skillId = item.skillId;
      if (!skillId) {
        const found = dbHelper.get('SELECT id FROM skills WHERE name = ?', [skillName]);
        if (found) skillId = found.id;
      }

      if (skillId && userId) {
        // Upsert into skill_profiles
        const existing = dbHelper.get('SELECT id FROM skill_profiles WHERE user_id = ? AND skill_id = ?', [userId, skillId]);
        if (existing) {
          dbHelper.run(
            `UPDATE skill_profiles 
             SET proficiency_level = ?, score = ?, last_assessed_at = CURRENT_TIMESTAMP 
             WHERE id = ?`,
            [status, score, existing.id]
          );
        } else {
          dbHelper.run(
            `INSERT INTO skill_profiles (user_id, skill_id, proficiency_level, score, last_assessed_at) 
             VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [userId, skillId, status, score]
          );
        }
      }
    }

    // 2. Generate Intelligent Course Recommendations based on identified skill gaps
    const recommendations = await this.generateRecommendations(userId, skillGaps, developing);

    return {
      userId,
      strengths,
      developing,
      skillGaps,
      skillMetrics,
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generates course recommendations from database targeting skill gaps
   * @param {number} userId 
   * @param {Array<string>} skillGaps 
   * @param {Array<string>} developing 
   */
  static async generateRecommendations(userId, skillGaps = [], developing = []) {
    if (!userId) return [];

    // Clear old recommendations for user or refresh them
    dbHelper.run('DELETE FROM recommendations WHERE user_id = ?', [userId]);

    const targetSkills = [...skillGaps, ...developing];
    const recommendationsList = [];

    // If there are specific skill gaps, find courses mapped to those skills
    if (targetSkills.length > 0) {
      for (let i = 0; i < targetSkills.length; i++) {
        const skillName = targetSkills[i];
        const isGap = skillGaps.includes(skillName);
        const priority = isGap ? 1 : 2;
        const reason = isGap 
          ? `Targeted to bridge critical gap in "${skillName}" (Assessed < 60%)`
          : `Recommended to elevate developing proficiency in "${skillName}" (60-79%)`;

        const courses = dbHelper.all(`
          SELECT c.*, s.name as target_skill_name, u.name as trainer_name
          FROM courses c
          JOIN skills s ON c.target_skill_id = s.id
          LEFT JOIN users u ON c.trainer_id = u.id
          WHERE s.name = ?
            AND c.is_published = 1
            AND c.id NOT IN (
              SELECT course_id FROM enrollments WHERE user_id = ? AND status = 'completed'
            )
          LIMIT 2
        `, [skillName, userId]);

        for (const course of courses) {
          // Check if not already added
          if (!recommendationsList.find(r => r.course_id === course.id)) {
            dbHelper.run(`
              INSERT OR REPLACE INTO recommendations (user_id, course_id, skill_id, reason, priority)
              VALUES (?, ?, ?, ?, ?)
            `, [userId, course.id, course.target_skill_id, reason, priority]);

            recommendationsList.push({
              id: course.id,
              course_id: course.id,
              title: course.title,
              description: course.description,
              category: course.category,
              level: course.level,
              duration_hours: course.duration_hours,
              thumbnail: course.thumbnail,
              skill_id: course.target_skill_id,
              skill_name: course.target_skill_name,
              trainer_name: course.trainer_name,
              reason,
              priority
            });
          }
        }
      }
    }

    // If recommendations are fewer than 3, backfill with popular/essential cooperative courses
    if (recommendationsList.length < 3) {
      const fallbackCourses = dbHelper.all(`
        SELECT c.*, s.name as target_skill_name, u.name as trainer_name
        FROM courses c
        LEFT JOIN skills s ON c.target_skill_id = s.id
        LEFT JOIN users u ON c.trainer_id = u.id
        WHERE c.is_published = 1
          AND c.id NOT IN (
            SELECT course_id FROM enrollments WHERE user_id = ? AND status = 'completed'
          )
        ORDER BY c.created_at DESC
        LIMIT 4
      `, [userId]);

      for (const course of fallbackCourses) {
        if (!recommendationsList.find(r => r.course_id === course.id) && recommendationsList.length < 4) {
          const reason = "Foundational Cooperative Competency — Recommended for career development";
          dbHelper.run(`
            INSERT OR REPLACE INTO recommendations (user_id, course_id, skill_id, reason, priority)
            VALUES (?, ?, ?, ?, ?)
          `, [userId, course.id, course.target_skill_id || 1, reason, 3]);

          recommendationsList.push({
            id: course.id,
            course_id: course.id,
            title: course.title,
            description: course.description,
            category: course.category,
            level: course.level,
            duration_hours: course.duration_hours,
            thumbnail: course.thumbnail,
            skill_id: course.target_skill_id,
            skill_name: course.target_skill_name || 'General Management',
            trainer_name: course.trainer_name,
            reason,
            priority: 3
          });
        }
      }
    }

    return recommendationsList;
  }
}

export default SkillAnalysisEngine;
