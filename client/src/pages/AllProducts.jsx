import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

// Full product list. Also shows search results when the address has ?q=...
export default function AllProducts() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    api(`/products${q ? `?search=${encodeURIComponent(q)}` : ''}`)
      .then((d) => { setProducts(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <>
      <div className="cat-head">
        <Link to="/" className="back-link">← Back to store</Link>
        <h1>{q ? `Results for “${q}”` : 'All Products'}</h1>
        {!loading && <p>{products.length} {products.length === 1 ? 'product' : 'products'}</p>}
      </div>

      {error && <p className="error">{error}</p>}
      {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products found.</p> : (
        <div className="products">
          {products.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </>
  );
}