// Demo mode: sample data used automatically when the database / server is unavailable.
let active = false;
const listeners = new Set();

export const demo = {
  get active() { return active; },
  activate() { if (!active) { active = true; listeners.forEach((l) => l()); } },
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
};

const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SIZED = ['Shoes', 'Women'];

const CATALOG = {
  Men: ['Linen Button-Up Shirt', 'Slim Fit Chinos', 'Classic Denim Jacket', 'Cotton Polo Shirt'],
  Women: ['Floral Summer Dress', 'Soft Knit Cardigan', 'Satin Midi Dress', 'Wrap Maxi Dress'],
  Shoes: ['White Leather Sneakers', 'Suede Chelsea Boots', 'Everyday Running Shoes', 'Leather Loafers'],
  Bags: ['Leather Tote Bag', 'Minimal Crossbody Bag', 'Canvas Backpack', 'Mini Shoulder Bag'],
  Watches: ['Classic Chronograph Watch', 'Rose Gold Mesh Watch', 'Minimal Leather Watch', 'Sport Smart Watch'],
  Accessories: ['Aviator Sunglasses', 'Silk Scarf', 'Leather Belt', 'Wool Beanie'],
};

let products = null;
let orders = [];
let counter = 0;
const wish = new Set();

function build() {
  let n = 0;
  products = [];
  Object.entries(CATALOG).forEach(([category, names]) => names.forEach((name) => {
    n += 1;
    products.push({
      _id: `demo-p${n}`,
      name,
      category,
      description: `A customer favourite from our ${category} collection. Quality materials and a comfortable fit.`,
      price: Number((rand(20, 180) + pick([0, 0.5, 0.99])).toFixed(2)),
      image: `https://picsum.photos/seed/demo-${n}-${name.replace(/\s+/g, '')}/600/660`,
      countInStock: rand(3, 60),
      rating: pick([3, 3.5, 4, 4.5, 5]),
      numReviews: rand(12, 480),
    });
  }));
  products.sort(() => Math.random() - 0.5); // different "trending" row every time
  products[rand(0, products.length - 1)].countInStock = 0; // one sold-out item
  products.forEach((p, i) => { p.createdAt = new Date(Date.now() - i * 3600e3).toISOString(); });

  orders = [1, 2, 3].map((k) => {
    const items = [...products].sort(() => Math.random() - 0.5).slice(0, rand(1, 3)).map((p) => ({
      product: p._id, name: p.name, price: p.price, qty: rand(1, 2), size: SIZED.includes(p.category) ? pick(SIZES) : undefined,
    }));
    return {
      _id: `demo-o${k}`,
      items,
      totalPrice: Number(items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)),
      status: pick(['placed', 'shipped', 'delivered']),
      createdAt: new Date(Date.now() - k * rand(2, 6) * 86400e3).toISOString(),
    };
  });
}

export async function demoApi(path, { method = 'GET', body } = {}) {
  if (!products) build();
  await new Promise((r) => setTimeout(r, 150));
  const [route, qs = ''] = path.split('?');
  const params = new URLSearchParams(qs);
  let m;

  if (route === '/products' && method === 'GET') {
    const s = (params.get('search') || '').toLowerCase();
    const c = params.get('category');
    return products.filter((p) => (!c || p.category === c) && (!s || p.name.toLowerCase().includes(s)));
  }
  if (route === '/products' && method === 'POST') {
    counter += 1;
    const p = { ...body, _id: `demo-new${counter}`, rating: pick([3, 3.5, 4, 4.5, 5]), numReviews: rand(12, 480), createdAt: new Date().toISOString() };
    products.unshift(p);
    return p;
  }
  if ((m = route.match(/^\/products\/(.+)$/))) {
    const id = m[1];
    const i = products.findIndex((p) => p._id === id);
    if (method === 'GET') { if (i < 0) throw new Error('Product not found'); return products[i]; }
    if (method === 'PUT') { if (i < 0) throw new Error('Product not found'); products[i] = { ...products[i], ...body }; return products[i]; }
    if (method === 'DELETE') { products = products.filter((p) => p._id !== id); wish.delete(id); return { message: 'Deleted' }; }
  }

  if (route === '/auth/login' || route === '/auth/register') {
    const email = (body?.email || 'demo@shop.com').toLowerCase();
    const name = body?.name || (email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1));
    return { _id: 'demo-user', name, email, isAdmin: route === '/auth/login' && email === 'admin@shop.com', token: 'demo-token' };
  }

  if (route === '/wishlist' && method === 'GET') return products.filter((p) => wish.has(p._id));
  if ((m = route.match(/^\/wishlist\/(.+)$/))) {
    if (method === 'POST') wish.add(m[1]); else wish.delete(m[1]);
    return { message: 'ok' };
  }

  if (route === '/orders/mine') return orders;
  if (route === '/orders' && method === 'POST') {
    counter += 1;
    const items = body.items.map((i) => {
      const p = products.find((x) => x._id === i.product) || {};
      return { product: i.product, name: p.name, price: p.price || 0, qty: i.qty, size: i.size || undefined };
    });
    const order = {
      _id: `demo-order${counter}`, items, shippingAddress: body.shippingAddress, status: 'placed',
      totalPrice: Number(items.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2)),
      createdAt: new Date().toISOString(),
    };
    orders.unshift(order);
    return order;
  }

  throw new Error('This action is not available in demo mode');
}
