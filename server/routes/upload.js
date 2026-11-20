import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { protect, admin } from '../middleware/auth.js';

export const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, crypto.randomUUID() + EXT[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed')),
});

const router = Router();

router.post('/', protect, admin, (req, res) => {
  upload.single('image')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 5 MB' : err.message });
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    res.status(201).json({ url: `/api/uploads/${req.file.filename}` });
  });
});

export default router;