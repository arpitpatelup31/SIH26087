import { dbHelper } from '../config/db.js';
import crypto from 'node:crypto';

export class CertificateService {
  /**
   * Generates or retrieves an official certificate for a completed course
   */
  static generateCertificate(userId, courseId, grade = 'A') {
    // Check if certificate already exists
    const existing = dbHelper.get(
      'SELECT * FROM certificates WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    if (existing) {
      return this.formatCertificate(existing);
    }

    // Generate unique verification hash & certificate number
    const certNumber = `COOP-SIH-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const verificationData = `${userId}-${courseId}-${certNumber}-${new Date().toISOString()}`;
    const verificationHash = crypto.createHash('sha256').update(verificationData).digest('hex').substring(0, 24);

    const result = dbHelper.run(`
      INSERT INTO certificates (certificate_number, user_id, course_id, issue_date, grade, verification_hash, status)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, 'valid')
    `, [certNumber, userId, courseId, grade, verificationHash]);

    const created = dbHelper.get('SELECT * FROM certificates WHERE id = ?', [result.lastInsertRowid]);
    return this.formatCertificate(created);
  }

  static getCertificateById(certificateId) {
    const cert = dbHelper.get('SELECT * FROM certificates WHERE id = ?', [certificateId]);
    if (!cert) return null;
    return this.formatCertificate(cert);
  }

  static getUserCertificates(userId) {
    const certs = dbHelper.all(`
      SELECT c.*, co.title as course_title, co.category as course_category, 
             u.name as student_name, u.cooperative_society, u.member_id,
             t.name as trainer_name
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users t ON co.trainer_id = t.id
      WHERE c.user_id = ?
      ORDER BY c.issue_date DESC
    `, [userId]);

    return certs;
  }

  static formatCertificate(cert) {
    const details = dbHelper.get(`
      SELECT c.*, co.title as course_title, co.description as course_description,
             co.category as course_category, co.duration_hours,
             u.name as student_name, u.email as student_email,
             u.cooperative_society, u.member_id,
             t.name as trainer_name
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users t ON co.trainer_id = t.id
      WHERE c.id = ?
    `, [cert.id]);

    return details || cert;
  }
}

export default CertificateService;
