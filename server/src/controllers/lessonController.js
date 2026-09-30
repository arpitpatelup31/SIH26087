import { dbHelper } from '../config/db.js';

export const getLessonById = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const lesson = dbHelper.get(`
      SELECT l.*, m.title as module_title, m.course_id, c.title as course_title, c.category as course_category
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE l.id = ?
    `, [id]);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Check completion status for this user
    let isCompleted = false;
    if (userId) {
      const progress = dbHelper.get(
        'SELECT is_completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?',
        [userId, id]
      );
      isCompleted = progress ? !!progress.is_completed : false;
    }

    // Find next and previous lesson in the course
    const allCourseLessons = dbHelper.all(`
      SELECT l.id, l.title, l.module_id, m.order_index as module_order, l.order_index as lesson_order
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE m.course_id = ?
      ORDER BY m.order_index ASC, l.order_index ASC
    `, [lesson.course_id]);

    const currentIndex = allCourseLessons.findIndex(l => l.id === Number(id));
    const prevLesson = currentIndex > 0 ? allCourseLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allCourseLessons.length - 1 ? allCourseLessons[currentIndex + 1] : null;

    // Check if there is an associated quiz in this module
    const moduleQuiz = dbHelper.get(`
      SELECT id, title, duration_mins FROM quizzes WHERE module_id = ?
    `, [lesson.module_id]);

    res.json({
      success: true,
      lesson: {
        ...lesson,
        isCompleted,
        prevLesson,
        nextLesson,
        moduleQuiz,
        currentIndex: currentIndex + 1,
        totalLessonsInCourse: allCourseLessons.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching lesson', error: err.message });
  }
};

export const completeLesson = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const lesson = dbHelper.get(`
      SELECT l.id, l.module_id, m.course_id 
      FROM lessons l
      JOIN modules m ON l.module_id = m.id
      WHERE l.id = ?
    `, [id]);

    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    // Ensure enrollment exists
    let enrollment = dbHelper.get('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?', [userId, lesson.course_id]);
    if (!enrollment) {
      dbHelper.run(`
        INSERT INTO enrollments (user_id, course_id, status, progress_percent, enrolled_at)
        VALUES (?, ?, 'in_progress', 0.0, CURRENT_TIMESTAMP)
      `, [userId, lesson.course_id]);
    }

    // Mark lesson complete in lesson_progress
    dbHelper.run(`
      INSERT OR REPLACE INTO lesson_progress (user_id, lesson_id, course_id, is_completed, completed_at)
      VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)
    `, [userId, id, lesson.course_id]);

    // Recalculate course progress
    const totalLessons = dbHelper.get(`
      SELECT COUNT(*) as count 
      FROM lessons l 
      JOIN modules m ON l.module_id = m.id 
      WHERE m.course_id = ?
    `, [lesson.course_id]).count;

    const completedLessons = dbHelper.get(`
      SELECT COUNT(*) as count 
      FROM lesson_progress 
      WHERE user_id = ? AND course_id = ? AND is_completed = 1
    `, [userId, lesson.course_id]).count;

    const progressPercent = totalLessons > 0 ? Math.min(100, Math.round((completedLessons / totalLessons) * 100)) : 100;
    const isFullyFinished = progressPercent >= 100;
    const status = isFullyFinished ? 'completed' : 'in_progress';
    const completedAt = isFullyFinished ? new Date().toISOString() : null;

    dbHelper.run(`
      UPDATE enrollments 
      SET progress_percent = ?, status = ?, completed_at = COALESCE(?, completed_at)
      WHERE user_id = ? AND course_id = ?
    `, [progressPercent, status, completedAt, userId, lesson.course_id]);

    res.json({
      success: true,
      message: 'Lesson marked as completed',
      progressPercent,
      isFullyFinished,
      completedLessons,
      totalLessons
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error marking lesson as completed', error: err.message });
  }
};
