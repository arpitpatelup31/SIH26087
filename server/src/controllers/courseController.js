import { dbHelper } from '../config/db.js';

export const getCourses = (req, res) => {
  try {
    const { category, search, level } = req.query;
    const userId = req.user ? req.user.id : null;

    let query = `
      SELECT c.*, s.name as target_skill_name, s.category as skill_category,
             u.name as trainer_name,
             (SELECT COUNT(*) FROM modules m WHERE m.course_id = c.id) as module_count,
             (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) as lesson_count,
             (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) as total_enrolled
      FROM courses c
      LEFT JOIN skills s ON c.target_skill_id = s.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.is_published = 1
    `;
    const params = [];

    if (category && category !== 'All') {
      query += ' AND c.category = ?';
      params.push(category);
    }

    if (level && level !== 'All') {
      query += ' AND c.level = ?';
      params.push(level);
    }

    if (search) {
      query += ' AND (c.title LIKE ? OR c.description LIKE ? OR s.name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY c.created_at DESC';

    const courses = dbHelper.all(query, params);

    // If user is logged in, attach their enrollment & progress status
    const coursesWithEnrollment = courses.map(course => {
      let enrollment = null;
      if (userId) {
        enrollment = dbHelper.get(`
          SELECT status, progress_percent, enrolled_at, completed_at
          FROM enrollments
          WHERE user_id = ? AND course_id = ?
        `, [userId, course.id]);
      }
      return {
        ...course,
        isEnrolled: !!enrollment,
        enrollmentStatus: enrollment ? enrollment.status : null,
        progressPercent: enrollment ? enrollment.progress_percent : 0
      };
    });

    res.json({
      success: true,
      count: coursesWithEnrollment.length,
      courses: coursesWithEnrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching courses', error: err.message });
  }
};

export const getCourseById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const course = dbHelper.get(`
      SELECT c.*, s.name as target_skill_name, s.category as skill_category,
             u.name as trainer_name, u.email as trainer_email, u.cooperative_society as trainer_society
      FROM courses c
      LEFT JOIN skills s ON c.target_skill_id = s.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE c.id = ?
    `, [id]);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Fetch modules
    const modules = dbHelper.all(`
      SELECT * FROM modules WHERE course_id = ? ORDER BY order_index ASC
    `, [id]);

    // For each module, fetch lessons and quizzes
    const modulesWithContent = modules.map(m => {
      const lessons = dbHelper.all(`
        SELECT id, module_id, title, content_type, duration_mins, order_index
        FROM lessons
        WHERE module_id = ?
        ORDER BY order_index ASC
      `, [m.id]);

      const quizzes = dbHelper.all(`
        SELECT id, module_id, course_id, title, description, passing_score, duration_mins,
               (SELECT COUNT(*) FROM questions q WHERE q.quiz_id = quizzes.id) as question_count
        FROM quizzes
        WHERE module_id = ?
      `, [m.id]);

      return {
        ...m,
        lessons,
        quizzes
      };
    });

    // Course final assessment (quizzes without module_id or course level)
    const finalAssessments = dbHelper.all(`
      SELECT id, course_id, title, description, passing_score, duration_mins,
             (SELECT COUNT(*) FROM questions q WHERE q.quiz_id = quizzes.id) as question_count
      FROM quizzes
      WHERE course_id = ? AND (module_id IS NULL OR module_id = 0)
    `, [id]);

    // Check enrollment and lesson progress
    let enrollment = null;
    let completedLessonIds = [];
    let passedQuizIds = [];

    if (userId) {
      enrollment = dbHelper.get(`
        SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?
      `, [userId, id]);

      const progressRows = dbHelper.all(`
        SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND is_completed = 1
      `, [userId, id]);
      completedLessonIds = progressRows.map(r => r.lesson_id);

      const quizAttemptRows = dbHelper.all(`
        SELECT DISTINCT quiz_id FROM quiz_attempts WHERE user_id = ? AND course_id = ? AND passed = 1
      `, [userId, id]);
      passedQuizIds = quizAttemptRows.map(r => r.quiz_id);
    }

    // Calculate total lessons
    const totalLessons = modulesWithContent.reduce((acc, m) => acc + m.lessons.length, 0);

    res.json({
      success: true,
      course: {
        ...course,
        modules: modulesWithContent,
        finalAssessments,
        totalLessons,
        enrollment,
        completedLessonIds,
        passedQuizIds
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching course details', error: err.message });
  }
};

export const enrollInCourse = (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ success: false, message: 'Course ID is required' });
    }

    const course = dbHelper.get('SELECT id, title FROM courses WHERE id = ?', [courseId]);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existing = dbHelper.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);
    if (existing) {
      return res.json({
        success: true,
        message: 'Already enrolled in this course',
        enrollment: existing
      });
    }

    dbHelper.run(`
      INSERT INTO enrollments (user_id, course_id, status, progress_percent, enrolled_at)
      VALUES (?, ?, 'in_progress', 0.0, CURRENT_TIMESTAMP)
    `, [userId, courseId]);

    const enrollment = dbHelper.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, courseId]);

    res.status(201).json({
      success: true,
      message: `Enrolled successfully in ${course.title}`,
      enrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during enrollment', error: err.message });
  }
};

export const getUserCourses = (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    const enrolledCourses = dbHelper.all(`
      SELECT c.*, s.name as target_skill_name, u.name as trainer_name,
             e.status as enrollment_status, e.progress_percent, e.enrolled_at, e.completed_at,
             (SELECT COUNT(*) FROM lessons l JOIN modules m ON l.module_id = m.id WHERE m.course_id = c.id) as total_lessons,
             (SELECT COUNT(*) FROM lesson_progress lp WHERE lp.user_id = e.user_id AND lp.course_id = c.id AND lp.is_completed = 1) as completed_lessons,
             (SELECT id FROM certificates cert WHERE cert.user_id = e.user_id AND cert.course_id = c.id) as certificate_id
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN skills s ON c.target_skill_id = s.id
      LEFT JOIN users u ON c.trainer_id = u.id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    res.json({
      success: true,
      courses: enrolledCourses
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching user courses', error: err.message });
  }
};
