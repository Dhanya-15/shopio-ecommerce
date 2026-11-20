import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { money } from '../api.js';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return <p>Your cart is empty. <Link to="/">Continue shopping</Link></p>;

  return (
    <>
      <h1>Shopping cart</h1>
      {items.map((i) => (
        <div className="cart-row" key={i.key}>
          <img src={i.image} alt={i.name} />
          <div>
            <Link to={`/product/${i.product}`}>{i.name}</Link>
            {i.size && <small className="size-tag">Size: {i.size}</small>}
          </div>
          <span>{money(i.price)}</span>
          <select value={i.qty} onChange={(e) => setQty(i.key, Number(e.target.value))}>
            {[...Array(Math.min(i.countInStock, 10)).keys()].map((n) => <option key={n + 1}>{n + 1}</option>)}
          </select>
          <button className="danger" onClick={() => remove(i.key)}>Remove</button>
        </div>
      ))}
      <h2>Total: {money(total)}</h2>
      <button onClick={() => navigate('/checkout')}>Proceed to checkout</button>
    </>
  );
}
