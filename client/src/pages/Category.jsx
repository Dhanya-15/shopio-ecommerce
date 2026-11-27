import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ProductCard from '../components/ProductCard.jsx';

const NAMES = ['Men', 'Women', 'Shoes', 'Bags', 'Watches', 'Accessories'];
const GENDERED = ['Shoes', 'Bags', 'Watches']; // these have a Men / Women split
const AUDIENCE = ['Men', 'Women'];

const Count = ({ n }) => (
  <small style={{ color: 'var(--muted)', fontWeight: 400, fontSize: '.85rem', marginLeft: 6 }}>({n})</small>
);

export default function Category() {
  const { slug, gender: genderParam } = useParams();
  const name = NAMES.find((n) => n.toLowerCase() === slug.toLowerCase());
  const gender = AUDIENCE.find((g) => g.toLowerCase() === (genderParam || '').toLowerCase()) || '';
  const isAudience = AUDIENCE.includes(name); // the Men and Women pages
  const isGendered = GENDERED.includes(name); // Shoes, Bags, Watches

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [slug, genderParam]);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    api(isAudience ? '/products' : `/products?category=${encodeURIComponent(name)}`)
      .then((d) => { setProducts(d); setError(''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [name]);

  if (!name) return <p>Category not found. <Link to="/">Back to store</Link></p>;

  // what to show
  let title = name;
  let shown = products;
  let sections = [];
  if (isGendered && gender) {
    title = `${gender}'s ${name}`;
    shown = products.filter((p) => p.gender === gender);
  }
  if (isAudience) {
    sections = [
      { label: `${name}'s Clothing`, items: products.filter((p) => p.category === name), link: null },
      ...GENDERED.map((c) => ({
        label: `${name}'s ${c}`,
        items: products.filter((p) => p.category === c && p.gender === name),
        link: `/category/${c.toLowerCase()}/${name.toLowerCase()}`,
      })),
    ].filter((s) => s.items.length > 0);
    shown = sections.flatMap((s) => s.items);
  }

  const emptyText = isGendered && gender
    ? `No ${gender}'s ${name.toLowerCase()} yet. Please check back soon.`
    : `No products in ${name} yet. Please check back soon.`;

  return (
    <>
      <div className="cat-head">
        <Link to="/" className="back-link">← Back to store</Link>
        <h1>{title}</h1>
        {!loading && <p>{shown.length} {shown.length === 1 ? 'product' : 'products'}</p>}
      </div>

      <div className="chips">
        {NAMES.map((n) => (
          <Link key={n} to={`/category/${n.toLowerCase()}`} className={`chip ${n === name ? 'active' : ''}`}>{n}</Link>
        ))}
      </div>

      {/* Men / Women options for Shoes, Bags and Watches */}
      {isGendered && (
        <div className="chips">
          <Link to={`/category/${slug.toLowerCase()}`} className={`chip ${!gender ? 'active' : ''}`}>All {name}</Link>
          {AUDIENCE.map((g) => (
            <Link key={g} to={`/category/${slug.toLowerCase()}/${g.toLowerCase()}`} className={`chip ${gender === g ? 'active' : ''}`}>{g}</Link>
          ))}
        </div>
      )}

      {error && <p className="error">{error}</p>}

      {loading ? <p>Loading...</p> : shown.length === 0 ? (
        <p>{emptyText}</p>
      ) : isAudience ? (
        sections.map((s) => (
          <section key={s.label}>
            <div className="section-head">
              <h2>{s.label}<Count n={s.items.length} /></h2>
              {s.link && <Link to={s.link} className="text-btn">View all →</Link>}
            </div>
            <div className="products">
              {s.items.map((p) => <ProductCard key={p._id} p={p} />)}
            </div>
          </section>
        ))
      ) : (
        <div className="products">
          {shown.map((p) => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </>
  );
}
