import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [placed, setPlaced] = useState(false);

  if (!user) return <p>Please <Link to="/login">log in</Link> to check out.</p>;
  if (items.length === 0 && !placed) return <p>Your cart is empty.</p>;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/orders', {
        method: 'POST',
        body: { items: items.map(({ product, qty, size }) => ({ product, qty, size })), shippingAddress: form },
      });
      clear();
      setPlaced(true);
      setBusy(false);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <form className="form" onSubmit={submit}>
        <h1>Shipping</h1>
        {error && <p className="error">{error}</p>}
        <input required placeholder="Address" value={form.address} onChange={set('address')} />
        <input required placeholder="City" value={form.city} onChange={set('city')} />
        <input required placeholder="Postal code" value={form.postalCode} onChange={set('postalCode')} />
        <input required placeholder="Country" value={form.country} onChange={set('country')} />
        <p>Payment: pay on delivery</p>
        <h2>Total: {money(total)}</h2>
        <button disabled={busy}>{busy ? 'Placing order...' : 'Place order'}</button>
      </form>

      {placed && (
        <div className="modal-overlay">
          <div className="modal" role="dialog" aria-modal="true">
            <div className="modal-check">✓</div>
            <p>Order placed successfully. To track the order, please check your registered email.</p>
            <button className="btn" onClick={() => navigate('/orders')}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}
