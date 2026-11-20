import { Link } from 'react-router-dom';

export default function Track() {
  return (
    <div className="track-card">
      <div className="track-icon">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" />
        </svg>
      </div>
      <h1>Track Your Order</h1>
      <p>Your order will be delivered in a couple of days. Please check your email for more details.</p>
      <Link className="btn" to="/orders">View my orders</Link>
    </div>
  );
}
