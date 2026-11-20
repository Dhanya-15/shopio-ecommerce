import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { SIZES, needsSize } from '../sizes.js';
import Stars from '../components/Stars.jsx';

const CATEGORY_PAGES = ['men', 'women', 'shoes', 'bags', 'watches', 'accessories'];
const svg = { width: 26, height: 26, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('');
  const [sizeError, setSizeError] = useState(false);
  const [error, setError] = useState('');
  const { add } = useCart();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    setP(null); setSize(''); setQty(1); setSizeError(false);
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="error">{error}</p>;
  if (!p) return <p>Loading...</p>;

  const sized = needsSize(p);
  const out = p.countInStock === 0;
  const maxQty = Math.min(p.countInStock, 10);
  const liked = has(p._id);
  const catLink = CATEGORY_PAGES.includes(p.category.toLowerCase());

  const addToCart = () => {
    if (sized && !size) return setSizeError(true);
    add(p, qty, size);
    navigate('/cart');
  };

  return (
    <>
      <nav className="crumbs">
        <Link to="/">Home</Link><span>/</span>
        {catLink ? <Link to={`/category/${p.category.toLowerCase()}`}>{p.category}</Link> : <span>{p.category}</span>}
        <span>/</span><span>{p.name}</span>
      </nav>

      <div className="pd">
        <div className="pd-img"><img src={p.image} alt={p.name} /></div>

        <div className="pd-info">
          <span className="pd-cat">{p.category}</span>
          <h1>{p.name}</h1>

          {p.rating > 0 && (
            <div className="rating big">
              <Stars value={p.rating} />
              <span>{Number(p.rating).toFixed(1)} · {p.numReviews} reviews</span>
            </div>
          )}

          <p className="pd-price">{money(p.price)}</p>
          <span className={`stock ${out ? 'out' : p.countInStock <= 5 ? 'low' : ''}`}>
            {out ? 'Out of stock' : p.countInStock <= 5 ? `Only ${p.countInStock} left` : 'In stock'}
          </span>

          {p.description && <p className="pd-desc">{p.description}</p>}

          {sized && !out && (
            <div className="pd-block">
              <div className="pd-label">Size {size && <span>Selected: {size}</span>}</div>
              <div className="sizes">
                {SIZES.map((s) => (
                  <button key={s} type="button" className={`size-btn ${size === s ? 'selected' : ''}`} aria-pressed={size === s} onClick={() => { setSize(s); setSizeError(false); }}>{s}</button>
                ))}
              </div>
              {sizeError && <p className="error">Please select a size</p>}
            </div>
          )}

          <div className="pd-block pd-actions">
            {!out && (
              <div className="qty" aria-label="Quantity">
                <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">−</button>
                <span>{qty}</span>
                <button type="button" onClick={() => setQty(Math.min(maxQty, qty + 1))} aria-label="Increase">+</button>
              </div>
            )}
            <button className="pd-add" disabled={out} onClick={addToCart}>{out ? 'Out of stock' : 'Add to cart'}</button>
            <button type="button" className={`pd-wish ${liked ? 'liked' : ''}`} aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'} aria-pressed={liked} onClick={() => toggle(p)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8"><path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.4-9.3 9-9.3 9z" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="perks">
        <div className="perk">
          <svg {...svg}><path d="M4 12a8 8 0 108-8M4 4v5h5" /></svg>
          <strong>10 days return &amp; Exchange</strong>
        </div>
        <div className="perk">
          <svg {...svg}><rect x="2" y="6" width="20" height="12" rx="2" /><circle cx="12" cy="12" r="2.5" /><path d="M6 10v.01M18 14v.01" /></svg>
          <strong>Pay on Delivery</strong>
        </div>
        <div className="perk">
          <svg {...svg}><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>
          <strong>Free Delivery</strong>
        </div>
      </div>
    </>
  );
}
