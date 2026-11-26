import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import HashLink from './HashLink.jsx';

const Icon = ({ d, children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {d ? <path d={d} /> : children}
  </svg>
);

// page sections in the order they appear on the home page
const SECTIONS = ['home', 'categories', 'deals', 'trending', 'shop'];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState('home');
  const menuRef = useRef(null);

  useEffect(() => {
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  // highlight the menu item of the section the visitor is currently viewing
  useEffect(() => {
    if (pathname !== '/') { setActive(''); return undefined; }
    const update = () => {
      let current = 'home';
      for (const id of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 160) current = id;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && document.getElementById('shop')) current = 'shop';
      setActive(current);
    };
    update();
    const timer = setTimeout(update, 700); // again after the page content has loaded
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [pathname]);

  const search = (e) => {
    e.preventDefault();
    navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
    setOpen(false);
  };

  const goHome = () => { if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cls = (id) => (active === id ? 'active' : '');

  return (
    <header>
      <div className="topbar">
        <div className="topbar-inner">
          <span>
            {user?.isAdmin
              ? 'You can add or edit the product list in the account admin option and can check whether the features are working'
              : <>Free shipping on all orders over $50 &nbsp;|&nbsp; Easy returns</>}
          </span>
          <span className="topbar-right">
            <Link to="/support">Help &amp; Support</Link>
            <Link to="/track">Track Order</Link>
            <span>USD</span>
            <span>EN</span>
          </span>
        </div>
      </div>

      <div className="mainnav">
        <Link to="/" className="brand" onClick={goHome}>Shopio<span>.</span></Link>

        <nav className="menu">
          <Link to="/" className={cls('home')} onClick={goHome}>Home</Link>
          <HashLink id="shop" className={cls('shop')}>Shop</HashLink>
          <HashLink id="categories" className={cls('categories')}>Categories</HashLink>
          <HashLink id="deals" className={cls('deals')}>Deals</HashLink>
          <HashLink id="trending" className={cls('trending')}>New Arrivals</HashLink>
        </nav>

        <div className="icons">
          {open && (
            <form onSubmit={search}>
              <input autoFocus className="nav-search" placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
            </form>
          )}
          <button className="icon-btn" aria-label="Search" onClick={() => setOpen(!open)}>
            <Icon><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></Icon>
          </button>

          <div className="profile" ref={menuRef}>
            <button className="icon-btn" aria-label="Account" onClick={() => setMenu(!menu)}>
              <Icon><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></Icon>
            </button>
            {menu && (
              <div className="profile-menu" onClick={() => setMenu(false)}>
                {user ? (
                  <>
                    <div className="profile-name">Hi, {user.name}</div>
                    <Link to="/orders">Orders</Link>
                    <Link to="/wishlist">Wishlist</Link>
                    <Link to="/support">Help &amp; Support</Link>
                    {user.isAdmin && <Link to="/admin">Admin</Link>}
                    <button className="menu-item" onClick={() => { logout(); navigate('/'); }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                    <Link to="/support">Help &amp; Support</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link className="icon-btn" aria-label="Wishlist" to="/wishlist">
            <Icon d="M12 21s-7-4.6-9.3-9A5.3 5.3 0 0112 6a5.3 5.3 0 019.3 6c-2.3 4.4-9.3 9-9.3 9z" />
            {wishCount > 0 && <b className="badge">{wishCount}</b>}
          </Link>
          <Link className="icon-btn cart-btn" aria-label="Cart" to="/cart">
            <Icon><path d="M6 7h13l-1.5 9h-10z" /><path d="M6 7L5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="17" cy="20" r="1" /></Icon>
            {count > 0 && <b className="badge">{count}</b>}
          </Link>
        </div>
      </div>
    </header>
  );
}
