import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { toast } from '../toast.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext();
export const useWishlist = () => useContext(WishlistContext);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    setLoading(true);
    api('/wishlist')
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  const has = (id) => items.some((p) => p._id === id);

  // heart click: save if not saved, remove if saved
  const toggle = async (p) => {
    if (!user) {
      toast('Please log in to save items to your wishlist', 'info');
      return navigate('/login');
    }
    if (has(p._id)) {
      setItems((prev) => prev.filter((i) => i._id !== p._id));
      try {
        await api(`/wishlist/${p._id}`, { method: 'DELETE' });
        toast(`${p.name} removed from wishlist`, 'info');
      } catch (e) {
        setItems((prev) => [...prev, p]);
        toast(e.message || 'Could not update wishlist', 'error');
      }
    } else {
      setItems((prev) => [...prev, p]);
      try {
        await api(`/wishlist/${p._id}`, { method: 'POST' });
        toast(`${p.name} added to wishlist`);
      } catch (e) {
        setItems((prev) => prev.filter((i) => i._id !== p._id));
        toast(e.message || 'Could not update wishlist', 'error');
      }
    }
  };

  return (
    <WishlistContext.Provider value={{ items, has, toggle, loading, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}
