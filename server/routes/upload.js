import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { put } from '@vercel/blob';
import { protect, admin } from '../middleware/auth.js';

export const uploadDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'uploads');

const EXT = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

// files are kept in memory, then sent to Vercel Blob (or saved to disk on your own computer)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Vercel allows request bodies up to 4.5 MB
  fileFilter: (req, file, cb) =>
    EXT[file.mimetype] ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP or GIF images are allowed')),
});

const router = Router();

router.post('/', protect, admin, (req, res) => {
  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.code === 'LIMIT_FILE_SIZE' ? 'Image must be under 4 MB' : err.message });
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const name = `${crypto.randomUUID()}${EXT[req.file.mimetype]}`;
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) {
        const blob = await put(`products/${name}`, req.file.buffer, { access: 'public', contentType: req.file.mimetype });
        return res.status(201).json({ url: blob.url });
      }
      if (process.env.VERCEL) {
        return res.status(500).json({ message: 'Image storage is not set up. Create a Blob store in your Vercel project.' });
      }
      // local development: save into server/uploads
      fs.mkdirSync(uploadDir, { recursive: true });
      fs.writeFileSync(path.join(uploadDir, name), req.file.buffer);
      res.status(201).json({ url: `/api/uploads/${name}` });
    } catch (e) {
      res.status(500).json({ message: `Image upload failed: ${e.message}` });
    }
  });
});

export default router;
