import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import { dbHelper } from '../config/db.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Look up user from database
    const user = dbHelper.get(`
      SELECT u.id, u.name, u.email, u.role_id, u.cooperative_society, u.member_id, u.phone, u.avatar,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [decoded.userId]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session invalid' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token', error: err.message });
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role_name)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};
