import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ message: 'Not signed in' });
  try {
    const { id } = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.user = await User.findById(id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function admin(req, res, next) {
  if (req.user?.isAdmin) return next();
  res.status(403).json({ message: 'Admin access only' });
}
