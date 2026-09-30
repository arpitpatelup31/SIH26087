import { dbHelper } from '../config/db.js';

export const getSystemAnalytics = (req, res) => {
  try {
    const totalUsers = dbHelper.get('SELECT COUNT(*) as count FROM users').count;
    const totalCourses = dbHelper.get('SELECT COUNT(*) as count FROM courses').count;
    const totalEnrollments = dbHelper.get('SELECT COUNT(*) as count FROM enrollments').count;
    const totalCompletions = dbHelper.get("SELECT COUNT(*) as count FROM enrollments WHERE status = 'completed'").count;
    const totalCertificates = dbHelper.get('SELECT COUNT(*) as count FROM certificates').count;
    const totalQuizAttempts = dbHelper.get('SELECT COUNT(*) as count FROM quiz_attempts').count;

    // Role breakdown
    const roleStats = dbHelper.all(`
      SELECT r.name as role_name, COUNT(u.id) as user_count
      FROM roles r
      LEFT JOIN users u ON r.id = u.role_id
      GROUP BY r.id
    `);

    // Top identified skill gaps across all members
    const skillGapStats = dbHelper.all(`
      SELECT s.name as skill_name, s.category,
             COUNT(sp.id) as total_assessed,
             SUM(CASE WHEN sp.proficiency_level = 'Skill Gap' THEN 1 ELSE 0 END) as gap_count,
             SUM(CASE WHEN sp.proficiency_level = 'Developing' THEN 1 ELSE 0 END) as developing_count,
             SUM(CASE WHEN sp.proficiency_level = 'Strong' THEN 1 ELSE 0 END) as strong_count,
             ROUND(AVG(sp.score), 1) as avg_score
      FROM skills s
      JOIN skill_profiles sp ON s.id = sp.skill_id
      GROUP BY s.id
      ORDER BY gap_count DESC
    `);

    // Cooperative society level engagement
    const societyStats = dbHelper.all(`
      SELECT u.cooperative_society, COUNT(DISTINCT u.id) as member_count,
             COUNT(DISTINCT e.id) as enrollment_count,
             COUNT(DISTINCT c.id) as certificate_count
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.user_id
      LEFT JOIN certificates c ON u.id = c.user_id
      WHERE u.cooperative_society IS NOT NULL
      GROUP BY u.cooperative_society
      ORDER BY member_count DESC
      LIMIT 6
    `);

    // Recent system activity logs
    const recentSyncs = dbHelper.all(`
      SELECT sq.*, u.name as user_name, u.cooperative_society
      FROM sync_queue sq
      JOIN users u ON sq.user_id = u.id
      ORDER BY sq.created_at DESC
      LIMIT 8
    `);

    res.json({
      success: true,
      metrics: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCompletions,
        completionRate: totalEnrollments > 0 ? Math.round((totalCompletions / totalEnrollments) * 100) : 0,
        totalCertificates,
        totalQuizAttempts
      },
      roleStats,
      skillGapStats,
      societyStats,
      recentSyncs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching system analytics', error: err.message });
  }
};

export const getAllUsers = (req, res) => {
  try {
    const users = dbHelper.all(`
      SELECT u.id, u.name, u.email, u.role_id, u.cooperative_society, u.member_id, u.phone, u.avatar, u.created_at,
             r.name as role_name,
             (SELECT COUNT(*) FROM enrollments e WHERE e.user_id = u.id) as enrolled_count,
             (SELECT COUNT(*) FROM certificates c WHERE c.user_id = u.id) as certificate_count
      FROM users u
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.id ASC
    `);

    res.json({
      success: true,
      users
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching users', error: err.message });
  }
};

export const updateUserRole = (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ success: false, message: 'roleId is required' });
    }

    dbHelper.run('UPDATE users SET role_id = ? WHERE id = ?', [roleId, userId]);

    const updatedUser = dbHelper.get(`
      SELECT u.id, u.name, u.email, u.role_id, r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: updatedUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error updating user role', error: err.message });
  }
};
