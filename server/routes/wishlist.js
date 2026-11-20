import { Router } from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// the logged-in user's wishlist
router.get('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    res.json((user.wishlist || []).filter(Boolean));
  } catch (e) { next(e); }
});

// add a product
router.post('/:id', protect, async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ message: 'Invalid product' });
    if (!(await Product.exists({ _id: id }))) return res.status(404).json({ message: 'Product not found' });
    await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: id } });
    res.status(201).json({ message: 'Added to wishlist' });
  } catch (e) { next(e); }
});

// remove a product
router.delete('/:id', protect, async (req, res, next) => {
  try {
    await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.id } });
    res.json({ message: 'Removed from wishlist' });
  } catch (e) { next(e); }
});

export default router;