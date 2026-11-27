import { useEffect, useState } from 'react';
import { api, money, uploadImage } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

const CATEGORIES = ['Men', 'Women', 'Shoes', 'Bags', 'Watches', 'Accessories'];
const GENDERED = ['Shoes', 'Bags', 'Watches']; // these also need Men / Women
const empty = { name: '', description: '', price: '', category: '', gender: '', countInStock: '' };

export default function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0); // changing this clears the file input
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () => api('/products').then(setProducts).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  if (!user?.isAdmin) return <p>Admin access only.</p>;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  // choosing a category: the Men/Women list only stays for Shoes, Bags and Watches
  const setCategory = (e) => {
    const category = e.target.value;
    setForm({ ...form, category, gender: GENDERED.includes(category) ? form.gender : '' });
  };

  const reset = () => {
    setForm(empty);
    setFile(null);
    setFileKey((k) => k + 1);
    setEditingId(null);
  };

  // Edit: load the product into the same form at the top of the page
  const startEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      price: String(p.price),
      category: p.category,
      gender: p.gender || '',
      countInStock: String(p.countInStock),
    });
    setFile(null);
    setFileKey((k) => k + 1);
    setEditingId(p._id);
    setError('');
    setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setNotice('');
    if (!editingId && !file) return setError('Please choose a product image from your computer');
    if (file && file.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB');
    try {
      const body = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) };
      if (file) body.image = await uploadImage(file); // when editing without a new file, the old image stays
      if (editingId) await api(`/products/${editingId}`, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
      setNotice(editingId ? 'Product updated.' : 'Product added.');
      setError('');
      reset();
      load();
    } catch (err) { setError(err.message); }
  };

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    await api(`/products/${id}`, { method: 'DELETE' });
    if (editingId === id) reset();
    load();
  };

  // group products by category (fixed order first, then any older/other categories)
  const others = [...new Set(products.map((p) => p.category))].filter((c) => !CATEGORIES.includes(c));
  const groups = [...CATEGORIES, ...others]
    .map((name) => ({ name, items: products.filter((p) => p.category === name) }))
    .filter((g) => g.items.length > 0);

  const categoryOptions = form.category && !CATEGORIES.includes(form.category) ? [...CATEGORIES, form.category] : CATEGORIES;

  return (
    <>
      <h1>Manage products</h1>
      {error && <p className="error">{error}</p>}
      {notice && <p className="success">{notice}</p>}
      <form className="form" onSubmit={submit}>
        <input required placeholder="Name" value={form.name} onChange={set('name')} />
        <input placeholder="Description" value={form.description} onChange={set('description')} />
        <input required type="number" step="0.01" min="0" placeholder="Price" value={form.price} onChange={set('price')} />
        <input key={fileKey} required={!editingId} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => setFile(e.target.files[0] || null)} />
        {editingId && <small className="hint">Editing a product: leave the image empty to keep the current one.</small>}
        <select required value={form.category} onChange={setCategory}>
          <option value="" disabled>Select category</option>
          {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {GENDERED.includes(form.category) && (
          <select required value={form.gender} onChange={set('gender')}>
            <option value="" disabled>Select Men or Women</option>
            <option value="Men">Men</option>
            <option value="Women">Women</option>
          </select>
        )}
        <input required type="number" min="0" placeholder="Stock" value={form.countInStock} onChange={set('countInStock')} />
        <button>{editingId ? 'Update product' : 'Add product'}</button>
        {editingId && <button type="button" className="btn-light" onClick={reset}>Cancel</button>}
      </form>

      {products.length === 0 && <p>No products yet.</p>}
      {groups.map((g) => (
        <section key={g.name}>
          <h2 className="group-title">{g.name} <span>({g.items.length})</span></h2>
          {g.items.map((p) => (
            <div className="cart-row" key={p._id}>
              <img src={p.image} alt="" />
              <div>
                <span>{p.name}</span>
                {p.gender && <small className="size-tag">{p.gender}</small>}
              </div>
              <span>{money(p.price)}</span>
              <span>Stock: {p.countInStock}</span>
              <div className="row-actions">
                <button className="btn-light" onClick={() => startEdit(p)}>Edit</button>
                <button className="danger" onClick={() => del(p._id)}>Delete</button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </>
  );
}
