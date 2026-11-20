import { Router } from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const filter = {};
    if (search) filter.name = { $regex: String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (category) filter.category = String(category);
    res.json(await Product.find(filter).sort({ createdAt: -1 }));
  } catch (e) { next(e); }
});

// list of existing categories (must stay above '/:id')
router.get('/categories', async (req, res, next) => {
  try {
    const cats = await Product.distinct('category');
    res.json(cats.filter(Boolean).sort());
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) { next(e); }
});

router.post('/', protect, admin, async (req, res, next) => {
  try { res.status(201).json(await Product.create(req.body)); } catch (e) { next(e); }
});

router.put('/:id', protect, admin, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (e) { next(e); }
});

router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

export default router;