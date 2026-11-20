import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import './orders.css';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, [user]);

  if (!user) {
    return (
      <section className="orders">
        <div className="or-message">
          <h1>Log in to see your orders</h1>
          <p>Your order history is saved to your account.</p>
          <Link to="/login" className="btn">Log in</Link>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="orders">
        <p className="error" role="alert">{error}</p>
      </section>
    );
  }

  if (!orders) {
    return (
      <section className="orders" aria-busy="true">
        <header className="or-head"><h1>My orders</h1></header>
        <div className="or-list">
          {[0, 1, 2].map((n) => (
            <div className="order skeleton" key={n}>
              <div className="line" />
              <div className="line short" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (orders.length === 0) {
    return (
      <section className="orders">
        <div className="or-message">
          <h1>No orders yet</h1>
          <p>When you place an order, it will show up here.</p>
          <Link to="/" className="btn">Start shopping</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="orders">
      <header className="or-head">
        <h1>My orders</h1>
        <p>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</p>
      </header>

      <div className="or-list">
        {orders.map((o) => (
          <article className="order" key={o._id}>
            <header className="order-top">
              <div>
                <h2>Order #{String(o._id).slice(-6).toUpperCase()}</h2>
                <time dateTime={o.createdAt}>
                  {new Date(o.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </time>
              </div>
              <span className={`status ${String(o.status).toLowerCase()}`}>{o.status}</span>
            </header>

            <ul className="order-items">
              {o.items.map((i) => (
                <li key={i.product}>
                  <span className="qty">{i.qty} ×</span>
                  <span className="name">{i.name}</span>
                </li>
              ))}
            </ul>

            <footer className="order-total">
              <span>Total</span>
              <strong>{money(o.totalPrice)}</strong>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}