import { dbHelper } from '../config/db.js';
import CertificateService from '../services/certificateService.js';

export const getUserCertificates = (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const certificates = CertificateService.getUserCertificates(userId);

    res.json({
      success: true,
      count: certificates.length,
      certificates
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching certificates', error: err.message });
  }
};

export const getCertificateById = (req, res) => {
  try {
    const { id } = req.params;
    const cert = CertificateService.getCertificateById(id);

    if (!cert) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.json({
      success: true,
      certificate: cert
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching certificate', error: err.message });
  }
};

export const verifyCertificate = (req, res) => {
  try {
    const { query } = req.params; // Can be certificate_number or verification_hash

    const cert = dbHelper.get(`
      SELECT c.*, co.title as course_title, co.category as course_category, co.duration_hours,
             u.name as student_name, u.email as student_email, u.cooperative_society, u.member_id,
             t.name as trainer_name
      FROM certificates c
      JOIN courses co ON c.course_id = co.id
      JOIN users u ON c.user_id = u.id
      LEFT JOIN users t ON co.trainer_id = t.id
      WHERE c.certificate_number = ? OR c.verification_hash = ?
    `, [query, query]);

    if (!cert) {
      return res.status(404).json({
        success: false,
        isValid: false,
        message: 'No certificate matching this verification ID or hash exists.'
      });
    }

    res.json({
      success: true,
      isValid: true,
      message: 'Certificate is authentic and verified on CoopConnect Registry.',
      certificate: cert
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error verifying certificate', error: err.message });
  }
};
