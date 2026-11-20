import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // load the wishlist whenever someone logs in; clear it on logout
  useEffect(() => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    api('/wishlist')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const has = (id) => items.some((p) => p._id === id);

  // heart click: add if not saved, remove if saved (logged-out users are sent to log in)
  const toggle = async (p) => {
    if (!user) return navigate('/login');
    if (has(p._id)) {
      setItems((prev) => prev.filter((i) => i._id !== p._id));
      try { await api(`/wishlist/${p._id}`, { method: 'DELETE' }); }
      catch { setItems((prev) => [...prev, p]); }
    } else {
      setItems((prev) => [...prev, p]);
      try { await api(`/wishlist/${p._id}`, { method: 'POST' }); }
      catch { setItems((prev) => prev.filter((i) => i._id !== p._id)); }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, has, toggle, loading, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}