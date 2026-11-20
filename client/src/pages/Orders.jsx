import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, [user]);

  if (!user) return <p>Please <Link to="/login">log in</Link> to see your orders.</p>;
  if (error) return <p className="error">{error}</p>;
  if (!orders) return <p>Loading...</p>;
  if (orders.length === 0) return <p>No orders yet.</p>;

  return (
    <>
      <h1>My orders</h1>
      {orders.map((o) => (
        <div className="order" key={o._id}>
          <strong>{new Date(o.createdAt).toLocaleString()}</strong> · {o.status} · {money(o.totalPrice)}
          <ul>
            {o.items.map((i, n) => (
              <li key={`${i.product}-${i.size || ''}-${n}`}>{i.qty} × {i.name}{i.size ? ` (Size ${i.size})` : ''}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
