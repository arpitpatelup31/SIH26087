import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbHelper } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', cooperativeSociety = 'District Cooperative Bank Ltd.', memberId, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = dbHelper.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const roleRow = dbHelper.get('SELECT id FROM roles WHERE name = ?', [role]);
    const roleId = roleRow ? roleRow.id : 1; // Default to student

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedMemberId = memberId || `COOP-${Math.floor(10000 + Math.random() * 90000)}`;

    const result = dbHelper.run(`
      INSERT INTO users (name, email, password_hash, role_id, cooperative_society, member_id, phone, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, email.toLowerCase(), passwordHash, roleId, cooperativeSociety, assignedMemberId, phone || '+91 98765 43210', `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`]);

    const user = dbHelper.get(`
      SELECT u.id, u.name, u.email, u.role_id, u.cooperative_society, u.member_id, u.phone, u.avatar,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [result.lastInsertRowid]);

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role_name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during registration', error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = dbHelper.get(`
      SELECT u.id, u.name, u.email, u.password_hash, u.role_id, u.cooperative_society, u.member_id, u.phone, u.avatar,
             r.name as role_name
      FROM users u
      JOIN roles r ON u.role_id = r.id
      WHERE u.email = ?
    `, [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role_name }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    const { password_hash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error during login', error: err.message });
  }
};

export const getMe = (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

export const getDemoAccounts = (req, res) => {
  const users = dbHelper.all(`
    SELECT u.id, u.name, u.email, u.cooperative_society, u.member_id, u.avatar, r.name as role_name
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.role_id ASC, u.id ASC
  `);

  res.json({
    success: true,
    users
  });
};
