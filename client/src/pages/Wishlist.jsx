import { Link } from 'react-router-dom';
import { money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function Wishlist() {
  const { user } = useAuth();
  const { items, toggle, loading } = useWishlist();
  const { add } = useCart();

  if (!user) return <p>Please <Link to="/login">log in</Link> to see your wishlist.</p>;

  return (
    <>
      <div className="cat-head">
        <h1>My Wishlist</h1>
        {!loading && <p>{items.length} {items.length === 1 ? 'item' : 'items'}</p>}
      </div>

      {loading ? <p>Loading...</p> : items.length === 0 ? (
        <p>Your wishlist is empty. Tap the heart on any product to save it. <Link to="/">Browse products</Link></p>
      ) : (
        <div className="products">
          {items.map((p) => (
            <div className="pcard" key={p._id}>
              <div className="pimg">
                <Link to={`/product/${p._id}`}><img src={p.image} alt={p.name} /></Link>
              </div>
              <h3><Link to={`/product/${p._id}`}>{p.name}</Link></h3>
              <p className="price">{money(p.price)}</p>
              <button className="btn btn-sm" disabled={p.countInStock === 0} onClick={() => add(p)}>
                {p.countInStock === 0 ? 'Out of stock' : 'Add to cart'}
              </button>
              <button className="btn btn-sm btn-light" onClick={() => toggle(p)}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}