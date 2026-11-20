import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import './product.css';

export default function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  const { add } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setQty(1);
    api(`/products/${id}`).then(setP).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <section className="product">
        <Link to="/" className="back">&larr; Back to products</Link>
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  if (!p) {
    return (
      <section className="product" aria-busy="true">
        <span className="back">&larr; Back to products</span>
        <div className="detail skeleton">
          <div className="media" />
          <div className="body">
            <div className="line" />
            <div className="line short" />
            <div className="line" />
          </div>
        </div>
      </section>
    );
  }

  const inStock = p.countInStock > 0;

  return (
    <section className="product">
      <Link to="/" className="back">&larr; Back to products</Link>

      <div className="detail">
        <div className="media">
          <img src={p.image} alt={p.name} />
        </div>

        <div className="body">
          {p.category && <p className="category">{p.category}</p>}
          <h1>{p.name}</h1>
          <p className="price">{money(p.price)}</p>

          <p className={`stock ${inStock ? 'in' : 'out'}`}>
            {inStock ? `${p.countInStock} in stock` : 'Out of stock'}
          </p>

          {p.description && <p className="desc">{p.description}</p>}

          {inStock ? (
            <div className="buy">
              <div className="qty">
                <label htmlFor="qty">Quantity</label>
                <select id="qty" value={qty} onChange={(e) => setQty(Number(e.target.value))}>
                  {[...Array(Math.min(p.countInStock, 10)).keys()].map((n) => (
                    <option key={n + 1}>{n + 1}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                className="btn"
                onClick={() => { add(p, qty); navigate('/cart'); }}
              >
                Add to cart
              </button>
            </div>
          ) : (
            <button type="button" className="btn" disabled>Out of stock</button>
          )}
        </div>
      </div>
    </section>
  );
}