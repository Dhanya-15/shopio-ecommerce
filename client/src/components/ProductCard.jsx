import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

const Heart = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
    <path d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.4-9.3 9-9.3 9z" />
  </svg>
);

export default function ProductCard({ p }) {
  const { add } = useCart();
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
      <p className="price">{money(p.price)}</p>
      <button className="btn btn-sm" disabled={p.countInStock === 0} onClick={() => add(p)}>
        {p.countInStock === 0 ? 'Out of stock' : 'Add to cart'}
      </button>
    </div>
  );
}