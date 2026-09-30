import { dbHelper } from '../config/db.js';
import SkillAnalysisEngine from '../services/aiService.js';
import CertificateService from '../services/certificateService.js';

export const getQuizById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const quiz = dbHelper.get(`
      SELECT q.*, c.title as course_title, c.category as course_category, m.title as module_title
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      LEFT JOIN modules m ON q.module_id = m.id
      WHERE q.id = ?
    `, [id]);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Fetch questions (omit correct_option for test-taking integrity, or include if for review)
    const questions = dbHelper.all(`
      SELECT qn.id, qn.quiz_id, qn.question_text, qn.option_a, qn.option_b, qn.option_c, qn.option_d,
             qn.skill_id, s.name as skill_name, s.category as skill_category, qn.order_index
      FROM questions qn
      JOIN skills s ON qn.skill_id = s.id
      WHERE qn.quiz_id = ?
      ORDER BY qn.order_index ASC
    `, [id]);

    // Check previous attempts
    let previousAttempts = [];
    if (userId) {
      previousAttempts = dbHelper.all(`
        SELECT * FROM quiz_attempts
        WHERE user_id = ? AND quiz_id = ?
        ORDER BY completed_at DESC
      `, [userId, id]);
    }

    res.json({
      success: true,
      quiz: {
        ...quiz,
        questions,
        totalQuestions: questions.length,
        previousAttempts
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching quiz', error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // Array of { questionId, selectedOption }
    const userId = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array is required' });
    }

    const quiz = dbHelper.get(`
      SELECT q.*, c.title as course_title, c.id as course_id
      FROM quizzes q
      JOIN courses c ON q.course_id = c.id
      WHERE q.id = ?
    `, [id]);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Fetch actual questions from DB with correct answers and skill tags
    const dbQuestions = dbHelper.all(`
      SELECT qn.id, qn.question_text, qn.option_a, qn.option_b, qn.option_c, qn.option_d,
             qn.correct_option, qn.skill_id, s.name as skill_name, qn.explanation
      FROM questions qn
      JOIN skills s ON qn.skill_id = s.id
      WHERE qn.quiz_id = ?
    `, [id]);

    let correctCount = 0;
    const evaluatedAnswers = [];
    const skillScoreMap = {}; // skillId -> { skillName, correct, total }

    for (const q of dbQuestions) {
      const submitted = answers.find(a => a.questionId === q.id);
      const selectedOption = submitted ? submitted.selectedOption : '';
      const isCorrect = selectedOption.toUpperCase() === q.correct_option.toUpperCase();

      if (isCorrect) correctCount++;

      // Skill performance tracking
      if (!skillScoreMap[q.skill_id]) {
        skillScoreMap[q.skill_id] = {
          skillId: q.skill_id,
          skill: q.skill_name,
          correct: 0,
          total: 0
        };
      }
      skillScoreMap[q.skill_id].total += 1;
      if (isCorrect) skillScoreMap[q.skill_id].correct += 1;

      evaluatedAnswers.push({
        questionId: q.id,
        questionText: q.question_text,
        options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
        selectedOption,
        correctOption: q.correct_option,
        isCorrect,
        explanation: q.explanation,
        skillId: q.skill_id,
        skillName: q.skill_name
      });
    }

    const totalQuestions = dbQuestions.length;
    const percentageScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = percentageScore >= (quiz.passing_score || 60);

    // Save quiz attempt in database
    const attemptRes = dbHelper.run(`
      INSERT INTO quiz_attempts (user_id, quiz_id, course_id, score, total_questions, correct_answers, passed, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [userId, id, quiz.course_id, percentageScore, totalQuestions, correctCount, passed ? 1 : 0]);

    const attemptId = attemptRes.lastInsertRowid;

    // Save individual question breakdown
    for (const item of evaluatedAnswers) {
      dbHelper.run(`
        INSERT INTO quiz_answers (attempt_id, question_id, selected_option, is_correct, skill_id)
        VALUES (?, ?, ?, ?, ?)
      `, [attemptId, item.questionId, item.selectedOption, item.isCorrect ? 1 : 0, item.skillId]);
    }

    // Format skill assessment input for AI Engine
    const assessmentPayload = Object.values(skillScoreMap).map(s => {
      const skillScore = Math.round((s.correct / s.total) * 100);
      let status = 'Skill Gap';
      if (skillScore >= 80) status = 'Strong';
      else if (skillScore >= 60) status = 'Developing';

      // Insert record in assessment_results
      dbHelper.run(`
        INSERT INTO assessment_results (user_id, attempt_id, skill_id, score, status)
        VALUES (?, ?, ?, ?, ?)
      `, [userId, attemptId, s.skillId, skillScore, status]);

      return {
        skillId: s.skillId,
        skill: s.skill,
        score: skillScore,
        correct: s.correct,
        total: s.total
      };
    });

    // Run AI Skill Analysis & Recommendation Engine
    const aiAnalysis = await SkillAnalysisEngine.analyzeSkills(userId, assessmentPayload);

    // Check if course is fully completed (all quizzes passed + all lessons done)
    let certificate = null;
    if (passed) {
      const enrollment = dbHelper.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, quiz.course_id]);
      if (enrollment && enrollment.progress_percent >= 80) {
        // Issue Certificate
        certificate = CertificateService.generateCertificate(
          userId, 
          quiz.course_id, 
          percentageScore >= 90 ? 'A+' : percentageScore >= 75 ? 'A' : 'B'
        );
      }
    }

    res.json({
      success: true,
      message: passed ? 'Congratulations! You passed the quiz.' : 'Quiz completed. Keep learning to bridge skill gaps.',
      result: {
        attemptId,
        quizId: Number(id),
        quizTitle: quiz.title,
        courseId: quiz.course_id,
        courseTitle: quiz.course_title,
        score: percentageScore,
        totalQuestions,
        correctAnswers: correctCount,
        passingScore: quiz.passing_score,
        passed,
        evaluatedAnswers,
        skillPerformance: assessmentPayload,
        aiAnalysis,
        certificate
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error submitting quiz', error: err.message });
  }
};
