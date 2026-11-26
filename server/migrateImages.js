// One-time script: moves product images from your computer (server/uploads) to Vercel Blob
// and updates each product in the database with the new online link.
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { put } from '@vercel/blob';
import Product from './models/Product.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads');
const TYPES = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('Add BLOB_READ_WRITE_TOKEN to server/.env first (see the instructions).');
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 });

const products = await Product.find({ image: /^\/api\/uploads\// });
console.log(`${products.length} products need their image moved online`);

let moved = 0;
let missing = 0;
let failed = 0;

for (const p of products) {
  const file = path.basename(p.image);
  const full = path.join(dir, file);
  if (!fs.existsSync(full)) {
    console.log(`MISSING FILE for "${p.name}": ${file}`);
    missing += 1;
    continue;
  }
  try {
    const blob = await put(`products/${file}`, fs.readFileSync(full), {
      access: 'public',
      contentType: TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
      allowOverwrite: true,
    });
    await Product.updateOne({ _id: p._id }, { $set: { image: blob.url } });
    moved += 1;
    console.log(`OK      ${p.name}`);
  } catch (e) {
    failed += 1;
    console.log(`FAILED  "${p.name}": ${e.message}`);
  }
}

console.log(`\nDone. Moved: ${moved}   Missing files: ${missing}   Failed: ${failed}`);
await mongoose.disconnect();