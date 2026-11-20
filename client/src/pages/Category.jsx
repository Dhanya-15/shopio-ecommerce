import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const NAMES = ['Men', 'Women', 'Shoes', 'Bags', 'Watches', 'Accessories'];

export default function Category() {
  const { slug } = useParams();
  const name = NAMES.find((n) => n.toLowerCase() === slug.toLowerCase());

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    api(`/products?category=${encodeURIComponent(name)}`)
      .then((d) => { setProducts(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);

  if (!name) return <p>Category not found. <Link to="/">Back to store</Link></p>;

  return (
    <>
      <div className="cat-head">
        <Link to="/" className="back-link">← Back to store</Link>
        <h1>{name}</h1>
        {!loading && <p>{products.length} {products.length === 1 ? 'product' : 'products'}</p>}
      </div>

      <div className="chips">
        {NAMES.map((n) => (
          <Link key={n} to={`/category/${n.toLowerCase()}`} className={`chip ${n === name ? 'active' : ''}`}>{n}</Link>
        ))}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading...</p> : products.length === 0 ? (
        <p>No products in {name} yet. Please check back soon.</p>
      ) : (
        <div className="products">
          {products.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </>
  );
}