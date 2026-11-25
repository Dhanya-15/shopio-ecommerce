import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import Product, { randomRating, randomReviews } from './models/Product.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import uploadRoutes, { uploadDir } from './routes/upload.js';

const app = express();
app.use(cors());
app.use(express.json());

// quick check that the API is alive: open the server's address in a browser
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Shopio API is running' }));

// local development only (Vercel ignores static file serving; uploads go to Vercel Blob there)
app.use('/api/uploads', express.static(uploadDir));

// Connect to MongoDB when needed and reuse the connection between requests.
let connecting = null;
async function ensureDb() {
  if (mongoose.connection.readyState === 1) return true;
  if (!connecting) {
    connecting = mongoose
      .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
      .then(() => { backfillRatings().catch(() => {}); return true; })
      .catch((e) => { console.error('DB connection failed:', e.message); return false; })
      .finally(() => { connecting = null; });
  }
  return connecting;
}

// While the database is down, answer 503 so the website switches itself to demo mode.
app.use('/api', async (req, res, next) => {
  if (await ensureDb()) return next();
  res.status(503).json({ message: 'Database unavailable', demo: true });
});

app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const dbProblem = /MongoServerSelectionError|MongooseServerSelectionError|MongoNetworkError|MongoNetworkTimeoutError|MongoNotConnectedError|buffering timed out|ECONNREFUSED|ENOTFOUND/i;
  if (dbProblem.test(`${err.name} ${err.message}`)) {
    return res.status(503).json({ message: 'Database unavailable', demo: true });
  }
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// Give every product that has no rating yet a random 3-5 star rating (once per product).
async function backfillRatings() {
  const missing = await Product.find({ $or: [{ rating: { $exists: false } }, { numReviews: { $exists: false } }] }).select('_id');
  for (const { _id } of missing) {
    await Product.updateOne({ _id }, { $set: { rating: randomRating(), numReviews: randomReviews() } });
  }
}

// On your own computer we start a normal server. On Vercel the exported app is used instead.
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  ensureDb().then((ok) => console.log(ok ? 'MongoDB connected' : 'Database unreachable: the website will use demo mode'));
}

export default app;
