import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '../toast.js';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

// the same product in two different sizes is two separate cart lines
const keyOf = (id, size) => `${id}|${size || ''}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() =>
    JSON.parse(localStorage.getItem('cart') || '[]').map((i) => ({ ...i, key: i.key || keyOf(i.product, i.size) })));

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1, size = '') => {
    const key = keyOf(p._id, size);
    setItems((prev) => {
      const found = prev.find((i) => i.key === key);
      if (found) return prev.map((i) => i.key === key ? { ...i, qty: Math.min(i.qty + qty, p.countInStock) } : i);
      return [...prev, { key, product: p._id, name: p.name, price: p.price, image: p.image, size, countInStock: p.countInStock, qty: Math.min(qty, p.countInStock) }];
    });
    toast(`${p.name}${size ? ` (Size ${size})` : ''} added to cart`);
  };

  const setQty = (key, qty) => setItems((prev) => prev.map((i) => i.key === key ? { ...i, qty } : i));

  const remove = (key) => {
    const item = items.find((i) => i.key === key);
    setItems((prev) => prev.filter((i) => i.key !== key));
    if (item) toast(`${item.name} removed from cart`, 'info');
  };

  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
