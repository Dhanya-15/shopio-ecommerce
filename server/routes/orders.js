import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SIZED_CATEGORIES = ['Shoes', 'Women']; // categories that need a size

// Prices and stock come from the database, never from the client.
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

    const lines = [];
    let total = 0;
    for (const { product: id, qty, size } of items) {
      const p = await Product.findById(id);
      const q = parseInt(qty, 10);
      if (!p || !(q > 0)) return res.status(400).json({ message: 'Invalid item in cart' });
      if (p.countInStock < q) return res.status(400).json({ message: `Not enough stock for ${p.name}` });
      const sized = SIZED_CATEGORIES.includes(p.category);
      if (sized && !SIZES.includes(size)) return res.status(400).json({ message: `Please select a size for ${p.name}` });
      lines.push({ product: p._id, name: p.name, price: p.price, qty: q, size: sized ? size : undefined });
      total += p.price * q;
    }

    for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { countInStock: -l.qty } });

    const order = await Order.create({
      user: req.user._id,
      items: lines,
      shippingAddress,
      totalPrice: Math.round(total * 100) / 100,
    });
    res.status(201).json(order);
  } catch (e) { next(e); }
});

router.get('/mine', protect, async (req, res, next) => {
  try { res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 })); } catch (e) { next(e); }
});

export default router;
