import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import HashLink from '../components/HashLink.jsx';
import ProductCard from '../components/ProductCard.jsx';

// Replace these with your own photos (put files in client/public and use '/hero.jpg' etc.)
const HERO_IMG = 'src/images/hero.png';
const PROMO_BAG = 'src/images/handbag_banner1.png';
const PROMO_SUN = 'src/images/sunglasses_banner1.png';

const CATEGORIES = [
  { name: 'Men',         img: 'src/images/men.jpg' },
  { name: 'Women',       img: 'src/images/women.jpg' },
  { name: 'Shoes',       img: 'src/images/shoes.jpg' },
  { name: 'Bags',        img: 'src/images/bags.jpg' },
  { name: 'Watches',     img: 'src/images/watches.jpg' },
  { name: 'Accessories', img: 'src/images/accessories.jpg' },
];

const FEATURES = [
  { title: 'Free Shipping', text: 'On orders over $50', d: 'M3 7h11v9H3zM14 10h4l3 3v3h-7zM7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' },
  { title: 'Easy Returns', text: '30 day return policy', d: 'M4 12a8 8 0 108-8M4 4v5h5' },
  { title: 'Secure Payment', text: '100% secure checkout', d: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z' },
];

export default function Home() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const { hash } = useLocation();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api(`/products${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((d) => { setProducts(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  // when arriving from another page (e.g. /#shop), scroll once the content has loaded
  useEffect(() => {
    if (hash && !loading) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, loading]);

  const trending = products.slice(0, 5);
  const countOf = (c) => products.filter((p) => p.category === c).length;

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <img className="hero-img" src={HERO_IMG} alt="" />
        <div className="hero-text">
          <span className="pill">NEW COLLECTION 2022</span>
          <h1>Elevate Your<br />Everyday Style</h1>
          <p>Discover premium quality products crafted for comfort, style and performance.</p>
          <div className="row">
            <HashLink id="shop" className="btn">Shop Now</HashLink>
            <HashLink id="categories" className="btn btn-light">View Collection</HashLink>
          </div>
        </div>
        <div className="hero-features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={f.d} /></svg>
              <div><strong>{f.title}</strong><small>{f.text}</small></div>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORIES: each opens its own page */}
      <section id="categories" className="cats">
        {CATEGORIES.map((c) => (
          <Link key={c.name} to={`/category/${c.name.toLowerCase()}`} className="cat">
            <img src={c.img} alt={c.name} />
            <strong>{c.name}</strong>
            <small>{countOf(c.name)} items</small>
          </Link>
        ))}
      </section>

      {/* DEALS: SUMMER SALE + NEW ARRIVALS CARDS */}
      <section id="deals" className="promos">
        <div className="promo">
          <div>
            <small className="pill">SUMMER SALE</small>
            <h2>Up to 50%<br />Off</h2>
            <p>On selected items</p>
            <HashLink id="shop" className="btn">Shop Now</HashLink>
          </div>
          <img src={PROMO_BAG} alt="" />
        </div>
        <div className="promo promo-alt">
          <div>
            <small className="pill">NEW ARRIVALS</small>
            <h2>Discover The<br />Latest Trends</h2>
            <HashLink id="trending" className="btn">Explore Now</HashLink>
          </div>
          <img src={PROMO_SUN} alt="" />
        </div>
      </section>

      {error && <p className="error">{error}</p>}

      {/* TRENDING PRODUCTS (New Arrivals) */}
      {!q && (
        <section id="trending">
          <div className="section-head">
            <h2>Trending Products</h2>
            <HashLink id="shop" className="text-btn">View All →</HashLink>
          </div>
          {loading ? <p>Loading...</p> : trending.length === 0 ? <p>No products yet.</p> : (
            <div className="products">
              {trending.map((p) => <ProductCard key={p._id} p={p} />)}
            </div>
          )}
        </section>
      )}

      {/* SHOP: FULL PRODUCT LIST */}
      <section id="shop">
        <div className="section-head">
          <h2>{q ? `Results for “${q}”` : 'All Products'}</h2>
        </div>
        {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products found.</p> : (
          <div className="products">
            {products.map((p) => <ProductCard key={p._id} p={p} />)}
          </div>
        )}
      </section>
    </>
  );
}