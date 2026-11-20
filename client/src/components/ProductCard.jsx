import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { SIZES, needsSize } from '../sizes.js';
import Stars from './Stars.jsx';

const Heart = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.4-9.3 9-9.3 9z" />
  </svg>
);

// "Add to cart" button. For products that need a size, a small popup asks for the size first.
export function AddButton({ p }) {
  const { add } = useCart();
  const [picking, setPicking] = useState(false);
  const [size, setSize] = useState('');
  const [missing, setMissing] = useState(false);

  if (p.countInStock === 0) return <button className="btn btn-sm" disabled>Out of stock</button>;

  const click = () => {
    if (!needsSize(p)) return add(p);
    setSize('');
    setMissing(false);
    setPicking(true);
  };

  const confirm = () => {
    if (!size) return setMissing(true);
    add(p, 1, size);
    setPicking(false);
  };

  return (
    <>
      <button className="btn btn-sm" onClick={click}>Add to cart</button>
      {picking && (
        <div className="modal-overlay" onClick={() => setPicking(false)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label="Select size" onClick={(e) => e.stopPropagation()}>
            <h3>Select size</h3>
            <p className="modal-sub">{p.name}</p>
            <div className="sizes center">
              {SIZES.map((s) => (
                <button key={s} type="button" className={`size-btn ${size === s ? 'selected' : ''}`} aria-pressed={size === s} onClick={() => { setSize(s); setMissing(false); }}>{s}</button>
              ))}
            </div>
            {missing && <p className="error">Please select a size</p>}
            <div className="modal-actions">
              <button className="btn" onClick={confirm}>Add to cart</button>
              <button className="btn btn-light" onClick={() => setPicking(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function Rating({ p }) {
  if (!(p.rating > 0)) return null;
  return (
    <div className="rating">
      <Stars value={p.rating} />
      <span>{Number(p.rating).toFixed(1)} ({p.numReviews})</span>
    </div>
  );
}

export default function ProductCard({ p }) {
  const { has, toggle } = useWishlist();
  const liked = has(p._id);

  return (
    <div className="pcard">
      <div className="pimg">
        <Link to={`/product/${p._id}`}><img src={p.image} alt={p.name} /></Link>
        <button
          className={`heart ${liked ? 'liked' : ''}`}
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={liked}
          onClick={() => toggle(p)}
        >
          <Heart filled={liked} />
        </button>
      </div>
      <h3><Link to={`/product/${p._id}`}>{p.name}</Link></h3>
      <Rating p={p} />
      <p className="price">{money(p.price)}</p>
      <AddButton p={p} />
    </div>
  );
}
