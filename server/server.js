import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import wishlistRoutes from './routes/wishlist.js';
import uploadRoutes, { uploadDir } from './routes/upload.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/uploads', express.static(uploadDir)); // serves uploaded product images
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`API running on port ${PORT}`)))
  .catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });