import { Router } from 'express';
import mongoose from 'mongoose';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// the logged-in user's wishlist (as a list of products)
router.get('/', protect, async (req, res, next) => {
  try {
    const rows = await Wishlist.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('product');
    res.json(rows.map((r) => r.product).filter(Boolean));
  } catch (e) { next(e); }
});

// add a product
router.post('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product' });
    if (!(await Product.exists({ _id: id }))) return res.status(404).json({ message: 'Product not found' });
    await Wishlist.updateOne({ user: req.user._id, product: id }, { $setOnInsert: { user: req.user._id, product: id } }, { upsert: true });
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (e) { next(e); }
});

// remove a product
router.delete('/:id', protect, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid product' });
    await Wishlist.deleteOne({ user: req.user._id, product: req.params.id });
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { next(e); }
});

export default router;
