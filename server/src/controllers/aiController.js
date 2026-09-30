import { dbHelper } from '../config/db.js';
import SkillAnalysisEngine from '../services/aiService.js';

export const getUserSkills = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    // Get all skills with user proficiency if exists
    const skillProfiles = dbHelper.all(`
      SELECT s.id as skill_id, s.name as skill_name, s.category, s.description,
             sp.proficiency_level, sp.score, sp.last_assessed_at
      FROM skills s
      LEFT JOIN skill_profiles sp ON s.id = sp.skill_id AND sp.user_id = ?
      ORDER BY s.category ASC, s.name ASC
    `, [userId]);

    // Categorize
    const strengths = skillProfiles.filter(s => s.proficiency_level === 'Strong');
    const developing = skillProfiles.filter(s => s.proficiency_level === 'Developing');
    const skillGaps = skillProfiles.filter(s => s.proficiency_level === 'Skill Gap' || (s.score !== null && s.score < 60));
    const unassessed = skillProfiles.filter(s => !s.proficiency_level);

    // Recent assessments
    const recentAssessments = dbHelper.all(`
      SELECT ar.*, s.name as skill_name, s.category, qa.score as quiz_score, q.title as quiz_title,
             c.title as course_title
      FROM assessment_results ar
      JOIN skills s ON ar.skill_id = s.id
      JOIN quiz_attempts qa ON ar.attempt_id = qa.id
      JOIN quizzes q ON qa.quiz_id = q.id
      JOIN courses c ON qa.course_id = c.id
      WHERE ar.user_id = ?
      ORDER BY ar.created_at DESC
      LIMIT 10
    `, [userId]);

    res.json({
      success: true,
      data: {
        userId: Number(userId),
        skills: skillProfiles,
        summary: {
          strongCount: strengths.length,
          developingCount: developing.length,
          gapCount: skillGaps.length,
          unassessedCount: unassessed.length,
          overallProficiencyScore: skillProfiles.filter(s => s.score !== null).length > 0
            ? Math.round(skillProfiles.filter(s => s.score !== null).reduce((acc, s) => acc + s.score, 0) / skillProfiles.filter(s => s.score !== null).length)
            : 0
        },
        strengths,
        developing,
        skillGaps,
        recentAssessments
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user skills', error: err.message });
  }
};

export const analyzeSkillsDirect = async (req, res) => {
  try {
    const { userId, assessmentResults } = req.body;
    const targetUserId = userId || (req.user ? req.user.id : 1);

    if (!assessmentResults || !Array.isArray(assessmentResults)) {
      return res.status(400).json({ success: false, message: 'assessmentResults array is required' });
    }

    const analysis = await SkillAnalysisEngine.analyzeSkills(targetUserId, assessmentResults);

    res.json({
      success: true,
      strengths: analysis.strengths,
      developing: analysis.developing,
      skillGaps: analysis.skillGaps,
      recommendations: analysis.recommendations,
      skillMetrics: analysis.skillMetrics,
      timestamp: analysis.timestamp
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error running AI skill analysis', error: err.message });
  }
};

export const getUserRecommendations = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    // Get recommendations from DB table
    const recommendations = dbHelper.all(`
      SELECT r.*, c.title as course_title, c.description as course_description,
             c.category as course_category, c.level as course_level,
             c.duration_hours, c.thumbnail, s.name as target_skill_name,
             u.name as trainer_name
      FROM recommendations r
      JOIN courses c ON r.course_id = c.id
      JOIN skills s ON r.skill_id = s.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE r.user_id = ?
      ORDER BY r.priority ASC, r.created_at DESC
    `, [userId]);

    // If no recommendations exist yet, generate them dynamically from current skill profile or default
    if (recommendations.length === 0) {
      const gaps = dbHelper.all(`
        SELECT s.name FROM skill_profiles sp
        JOIN skills s ON sp.skill_id = s.id
        WHERE sp.user_id = ? AND sp.proficiency_level = 'Skill Gap'
      `, [userId]).map(r => r.name);

      const dev = dbHelper.all(`
        SELECT s.name FROM skill_profiles sp
        JOIN skills s ON sp.skill_id = s.id
        WHERE sp.user_id = ? AND sp.proficiency_level = 'Developing'
      `, [userId]).map(r => r.name);

      const generated = await SkillAnalysisEngine.generateRecommendations(userId, gaps, dev);
      return res.json({
        success: true,
        recommendations: generated
      });
    }

    res.json({
      success: true,
      recommendations
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching recommendations', error: err.message });
  }
};
