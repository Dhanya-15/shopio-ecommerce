import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));

  useEffect(() => localStorage.setItem('cart', JSON.stringify(items)), [items]);

  const add = (p, qty = 1) =>
    setItems((prev) => {
      const found = prev.find((i) => i.product === p._id);
      if (found) {
        return prev.map((i) => i.product === p._id ? { ...i, qty: Math.min(i.qty + qty, p.countInStock) } : i);
      }
      return [...prev, { product: p._id, name: p.name, price: p.price, image: p.image, countInStock: p.countInStock, qty: Math.min(qty, p.countInStock) }];
    });

  const setQty = (id, qty) => setItems((prev) => prev.map((i) => i.product === id ? { ...i, qty } : i));
  const remove = (id) => setItems((prev) => prev.filter((i) => i.product !== id));
  const clear = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.qty * i.price, 0);

  return <CartContext.Provider value={{ items, add, setQty, remove, clear, count, total }}>{children}</CartContext.Provider>;
}
