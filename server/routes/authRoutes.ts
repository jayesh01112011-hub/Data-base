import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db';
import { hashPassword, generateToken, requireAuth, AuthenticatedRequest } from '../auth';

const router = Router();

// Register
router.post('/register', (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Full name is required' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ success: false, error: 'Valid email address is required' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists' });
  }

  const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
  const now = new Date().toISOString();
  const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const passwordHash = hashPassword(password);

  try {
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, status, plan_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'user', 'active', 'free', ?, ?)
    `).run(userId, name.trim(), email.toLowerCase().trim(), passwordHash, now, now);

    db.prepare(`
      INSERT INTO subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, cancel_at_period_end)
      VALUES (?, ?, 'free', 'active', ?, ?, 0)
    `).run(`sub_${crypto.randomBytes(6).toString('hex')}`, userId, now, periodEnd);

    const user = {
      id: userId,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: 'user' as const,
      status: 'active' as const,
      plan_id: 'free'
    };

    const token = generateToken(user);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: 'Failed to create user account' });
  }
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const user = db.prepare(`
    SELECT id, name, email, password_hash, role, status, plan_id
    FROM users
    WHERE email = ?
  `).get(email.toLowerCase().trim()) as any;

  if (!user) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  const passwordHash = hashPassword(password);
  if (user.password_hash !== passwordHash) {
    return res.status(401).json({ success: false, error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ success: false, error: 'This account has been suspended by administration' });
  }

  const authUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    plan_id: user.plan_id
  };

  const token = generateToken(authUser);
  return res.json({
    success: true,
    message: 'Authentication successful',
    token,
    user: authUser
  });
});

// Current User Profile
router.get('/me', requireAuth, (req: AuthenticatedRequest, res) => {
  const user = req.user!;
  const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(user.plan_id) as any;
  const sub = db.prepare('SELECT * FROM subscriptions WHERE user_id = ?').get(user.id) as any;

  return res.json({
    success: true,
    user: {
      ...user,
      plan: plan ? {
        id: plan.id,
        name: plan.name,
        price_inr: plan.price_inr,
        monthly_quota: plan.monthly_quota,
        rate_limit_rps: plan.rate_limit_rps,
        features: JSON.parse(plan.features_json || '[]')
      } : null,
      subscription: sub || null
    }
  });
});

// Change Password
router.post('/change-password', requireAuth, (req: AuthenticatedRequest, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, error: 'New password must be at least 8 characters' });
  }

  const user = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(req.user!.id) as any;
  if (user.password_hash !== hashPassword(currentPassword)) {
    return res.status(400).json({ success: false, error: 'Current password is incorrect' });
  }

  db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?')
    .run(hashPassword(newPassword), new Date().toISOString(), req.user!.id);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// Quick demo login helper
router.post('/demo-login', (req, res) => {
  const { type } = req.body; // 'admin' | 'developer'
  const email = type === 'admin' ? 'admin@dataflow.dev' : 'developer@company.com';
  
  const user = db.prepare('SELECT id, name, email, role, status, plan_id FROM users WHERE email = ?').get(email) as any;
  if (!user) {
    return res.status(404).json({ success: false, error: 'Demo user not seeded' });
  }

  const token = generateToken(user);
  return res.json({
    success: true,
    message: `Logged in as ${type}`,
    token,
    user
  });
});

export default router;
