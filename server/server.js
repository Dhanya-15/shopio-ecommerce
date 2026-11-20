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

app.use('/api/uploads', express.static(uploadDir)); // uploaded product images

// While the database is down, answer 503 so the website switches itself to demo mode.
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState === 1) return next();
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

// Give every product that has no rating yet a random 3-5 star rating (runs once per product).
async function backfillRatings() {
  const missing = await Product.find({ $or: [{ rating: { $exists: false } }, { numReviews: { $exists: false } }] }).select('_id');
  for (const { _id } of missing) {
    await Product.updateOne({ _id }, { $set: { rating: randomRating(), numReviews: randomReviews() } });
  }
  if (missing.length) console.log(`Added ratings to ${missing.length} products`);
}

// The server keeps running even if the database is unreachable, and keeps retrying.
async function connectWithRetry() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
    await backfillRatings();
  } catch (e) {
    console.error('DB connection failed (the website will use demo mode):', e.message);
    setTimeout(connectWithRetry, 10000);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
connectWithRetry();
