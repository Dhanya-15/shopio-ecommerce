import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

// Photos are placeholders: replace `image` with your own product photo URLs.
const img = (s) => `https://picsum.photos/seed/${s}/600/660`;

const products = [
  { name: 'Aviator Sunglasses', price: 59.99, category: 'Accessories', countInStock: 40, image: img('sunglasses'), description: 'Polarised lenses with a lightweight metal frame.' },
  { name: 'White Leather Sneakers', price: 89.0, category: 'Shoes', countInStock: 35, image: img('sneakers'), description: 'Minimal everyday sneakers in soft leather.' },
  { name: 'Classic Chronograph Watch', price: 149.0, category: 'Watches', countInStock: 18, image: img('chrono'), description: 'Stainless steel case with a tan leather strap.' },
  { name: 'Leather Tote Bag', price: 119.0, category: 'Bags', countInStock: 22, image: img('totebag'), description: 'Roomy structured tote with an inner zip pocket.' },
  { name: 'Linen Button-Up Shirt', price: 45.0, category: 'Men', countInStock: 50, image: img('linenshirt'), description: 'Breathable relaxed-fit shirt for warm days.' },
  { name: 'Soft Knit Cardigan', price: 69.0, category: 'Women', countInStock: 30, image: img('cardigan'), description: 'Cosy oversized cardigan in a neutral knit.' },
  { name: 'Suede Chelsea Boots', price: 129.0, category: 'Shoes', countInStock: 15, image: img('boots'), description: 'Hand-finished suede boots with elastic side panels.' },
  { name: 'Minimal Crossbody Bag', price: 79.0, category: 'Bags', countInStock: 25, image: img('crossbody'), description: 'Compact bag with an adjustable strap.' },
  { name: 'Rose Gold Mesh Watch', price: 99.0, category: 'Watches', countInStock: 20, image: img('meshwatch'), description: 'Slim dial with an adjustable mesh strap.' },
  { name: 'Silk Scarf', price: 34.0, category: 'Accessories', countInStock: 45, image: img('scarf'), description: 'Printed silk-blend scarf in warm earth tones.' },
];

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);
await User.create({ name: 'Admin', email: 'admin15@shop.com', password: 'admin2202', isAdmin: true });
await Product.insertMany(products);
console.log('Seeded. Admin login: admin15@shop.com / admin2202');
await mongoose.disconnect();