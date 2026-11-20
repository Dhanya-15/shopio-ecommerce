import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import './checkout.css';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <section className="checkout">
        <div className="co-message">
          <h1>Log in to check out</h1>
          <p>You need an account to place an order.</p>
          <Link to="/login" className="btn">Log in</Link>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="checkout">
        <div className="co-message">
          <h1>Your cart is empty</h1>
          <p>Add a few products before checking out.</p>
          <Link to="/" className="btn">Continue shopping</Link>
        </div>
      </section>
    );
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: { items: items.map(({ product, qty }) => ({ product, qty })), shippingAddress: form },
      });
      clear();
      navigate('/orders');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="checkout">
      <header className="co-head">
        <h1>Checkout</h1>
        <Link to="/cart">Back to cart</Link>
      </header>

      <div className="co-layout">
        <form className="co-form" onSubmit={submit} id="checkout-form">
          <h2>Shipping address</h2>

          {error && <p className="error" role="alert">{error}</p>}

          <div className="field">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              required
              autoComplete="street-address"
              value={form.address}
              onChange={set('address')}
            />
          </div>

          <div className="row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                required
                autoComplete="address-level2"
                value={form.city}
                onChange={set('city')}
              />
            </div>
            <div className="field">
              <label htmlFor="postalCode">Postal code</label>
              <input
                id="postalCode"
                required
                autoComplete="postal-code"
                value={form.postalCode}
                onChange={set('postalCode')}
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="country">Country</label>
            <input
              id="country"
              required
              autoComplete="country-name"
              value={form.country}
              onChange={set('country')}
            />
          </div>

          <h2 className="pay-title">Payment</h2>
          <div className="pay">
            <strong>Pay on delivery</strong>
            <span>You pay when your order arrives. No payment details needed now.</span>
          </div>
        </form>

        <aside className="co-summary">
          <h2>Order summary</h2>
          <ul>
            {items.map((i) => (
              <li key={i.product}>
                <img src={i.image} alt="" />
                <div className="co-item">
                  <span className="co-name">{i.name}</span>
                  <span className="co-qty">Qty {i.qty}</span>
                </div>
                <span>{money(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="sum-row total">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
          <button type="submit" form="checkout-form" className="btn" disabled={busy}>
            {busy ? 'Placing order...' : 'Place order'}
          </button>
        </aside>
      </div>
    </section>
  );
}