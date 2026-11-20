import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';
import './cart.css';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <section className="cart">
        <div className="cart-empty">
          <h1>Your cart is empty</h1>
          <p>Add a few products and they will show up here.</p>
          <Link to="/" className="btn">Continue shopping</Link>
        </div>
      </section>
    );
  }

  const count = items.reduce((n, i) => n + i.qty, 0);

  return (
    <section className="cart">
      <header className="cart-head">
        <h1>Shopping cart</h1>
        <p>{count} {count === 1 ? 'item' : 'items'}</p>
      </header>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((i) => (
            <article className="cart-row" key={i.product}>
              <Link to={`/product/${i.product}`} className="cart-img">
                <img src={i.image} alt={i.name} />
              </Link>

              <div className="cart-info">
                <Link to={`/product/${i.product}`} className="cart-name">{i.name}</Link>
                <span className="cart-unit">{money(i.price)} each</span>
              </div>

              <div className="cart-qty">
                <label htmlFor={`qty-${i.product}`} className="sr-only">Quantity for {i.name}</label>
                <select
                  id={`qty-${i.product}`}
                  value={i.qty}
                  onChange={(e) => setQty(i.product, Number(e.target.value))}
                >
                  {[...Array(Math.min(i.countInStock, 10)).keys()].map((n) => (
                    <option key={n + 1}>{n + 1}</option>
                  ))}
                </select>
              </div>

              <strong className="cart-line">{money(i.price * i.qty)}</strong>

              <button
                type="button"
                className="cart-remove"
                onClick={() => remove(i.product)}
                aria-label={`Remove ${i.name} from cart`}
              >
                Remove
              </button>
            </article>
          ))}
        </div>

        <aside className="cart-summary">
          <h2>Order summary</h2>
          <div className="sum-row">
            <span>Subtotal ({count} {count === 1 ? 'item' : 'items'})</span>
            <span>{money(total)}</span>
          </div>
          <div className="sum-row total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button type="button" className="btn" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
          <Link to="/" className="cart-continue">Continue shopping</Link>
        </aside>
      </div>
    </section>
  );
}