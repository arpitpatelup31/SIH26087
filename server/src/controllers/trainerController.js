import { dbHelper } from '../config/db.js';

export const getTrainerStats = (req, res) => {
  try {
    const trainerId = req.user.id;

    // Total courses created by this trainer
    const totalCourses = dbHelper.get('SELECT COUNT(*) as count FROM courses WHERE trainer_id = ?', [trainerId]).count;

    // Total learners enrolled across trainer's courses
    const totalLearners = dbHelper.get(`
      SELECT COUNT(DISTINCT e.user_id) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.trainer_id = ?
    `, [trainerId]).count;

    // Total quizzes conducted & average score
    const quizStats = dbHelper.get(`
      SELECT COUNT(qa.id) as total_attempts, AVG(qa.score) as avg_score
      FROM quiz_attempts qa
      JOIN courses c ON qa.course_id = c.id
      WHERE c.trainer_id = ?
    `, [trainerId]);

    // Courses list created by this trainer
    const courses = dbHelper.all(`
      SELECT c.*, s.name as target_skill_name,
             (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count,
             (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) as lesson_count,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as enrolled_count,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id AND e.status = 'completed') as completed_count
      FROM courses c
      LEFT JOIN skills s ON c.target_skill_id = s.id
      WHERE c.trainer_id = ?
      ORDER BY c.created_at DESC
    `, [trainerId]);

    // Recent learner assessment submissions
    const recentAssessments = dbHelper.all(`
      SELECT qa.*, u.name as student_name, u.cooperative_society, u.email as student_email,
             c.title as course_title, q.title as quiz_title
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      JOIN courses c ON qa.course_id = c.id
      JOIN quizzes q ON qa.quiz_id = q.id
      WHERE c.trainer_id = ?
      ORDER BY qa.completed_at DESC
      LIMIT 10
    `, [trainerId]);

    res.json({
      success: true,
      stats: {
        totalCourses,
        totalLearners,
        totalAttempts: quizStats.total_attempts || 0,
        averageScore: quizStats.avg_score ? Math.round(quizStats.avg_score) : 0
      },
      courses,
      recentAssessments
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching trainer dashboard data', error: err.message });
  }
};

export const createCourse = (req, res) => {
  try {
    const { title, description, category, level = 'Beginner', duration_hours = 4, target_skill_id, thumbnail } = req.body;
    const trainerId = req.user.id;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description, and category are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${Date.now().toString().slice(-4)}`;

    const result = dbHelper.run(`
      INSERT INTO courses (title, slug, description, category, level, duration_hours, thumbnail, target_skill_id, trainer_id, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      title, 
      slug, 
      description, 
      category, 
      level, 
      duration_hours, 
      thumbnail || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      target_skill_id || 1,
      trainerId
    ]);

    const created = dbHelper.get('SELECT * FROM courses WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: created
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating course', error: err.message });
  }
};

export const addModule = (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, description, order_index } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Module title is required' });
    }

    const maxOrder = dbHelper.get('SELECT MAX(order_index) as max_order FROM modules WHERE course_id = ?', [courseId]).max_order || 0;

    const result = dbHelper.run(`
      INSERT INTO modules (course_id, title, description, order_index)
      VALUES (?, ?, ?, ?)
    `, [courseId, title, description || '', order_index || (maxOrder + 1)]);

    const module = dbHelper.get('SELECT * FROM modules WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Module added successfully',
      module
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding module', error: err.message });
  }
};

export const addLesson = (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, content, content_type = 'text', video_url, duration_mins = 15, order_index } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Lesson title and content are required' });
    }

    const maxOrder = dbHelper.get('SELECT MAX(order_index) as max_order FROM lessons WHERE module_id = ?', [moduleId]).max_order || 0;

    const result = dbHelper.run(`
      INSERT INTO lessons (module_id, title, content, content_type, video_url, duration_mins, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [moduleId, title, content, content_type, video_url || '', duration_mins, order_index || (maxOrder + 1)]);

    const lesson = dbHelper.get('SELECT * FROM lessons WHERE id = ?', [result.lastInsertRowid]);

    res.status(201).json({
      success: true,
      message: 'Lesson added successfully',
      lesson
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding lesson', error: err.message });
  }
};

export const createQuiz = (req, res) => {
  try {
    const { courseId } = req.params;
    const { moduleId, title, description, passing_score = 60, duration_mins = 15, questions = [] } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Quiz title is required' });
    }

    let quizId;
    dbHelper.transaction(() => {
      const qRes = dbHelper.run(`
        INSERT INTO quizzes (module_id, course_id, title, description, passing_score, duration_mins)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [moduleId || null, courseId, title, description || '', passing_score, duration_mins]);

      quizId = qRes.lastInsertRowid;

      if (Array.isArray(questions) && questions.length > 0) {
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i];
          dbHelper.run(`
            INSERT INTO questions (quiz_id, question_text, option_a, option_b, option_c, option_d, correct_option, skill_id, explanation, order_index)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            quizId,
            q.question_text,
            q.option_a,
            q.option_b,
            q.option_c,
            q.option_d,
            q.correct_option.toUpperCase(),
            q.skill_id || 1,
            q.explanation || '',
            i + 1
          ]);
        }
      }
    });

    const quiz = dbHelper.get('SELECT * FROM quizzes WHERE id = ?', [quizId]);
    const quizQuestions = dbHelper.all('SELECT * FROM questions WHERE quiz_id = ?', [quizId]);

    res.status(201).json({
      success: true,
      message: 'Quiz created successfully',
      quiz: { ...quiz, questions: quizQuestions }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error creating quiz', error: err.message });
  }
};

export const getLearnerProgress = (req, res) => {
  try {
    const { courseId } = req.params;

    const learners = dbHelper.all(`
      SELECT e.id as enrollment_id, e.user_id, e.status, e.progress_percent, e.enrolled_at, e.completed_at,
             u.name as student_name, u.email as student_email, u.cooperative_society, u.member_id,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.course_id = e.course_id AND lp.is_completed = 1) as completed_lessons,
             (SELECT MAX(qa.score) FROM quiz_attempts qa WHERE qa.user_id = e.user_id AND qa.course_id = e.course_id) as highest_quiz_score,
             (SELECT c.certificate_number FROM certificates c WHERE c.user_id = e.user_id AND c.course_id = e.course_id) as certificate_number
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = ?
      ORDER BY e.enrolled_at DESC
    `, [courseId]);

    res.json({
      success: true,
      learners
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching learner progress', error: err.message });
  }
};
