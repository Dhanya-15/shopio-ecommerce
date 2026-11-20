import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Replace with your own photo (e.g. put it in client/public and use '/auth.jpg')
const AUTH_IMG = 'https://picsum.photos/seed/shopio-auth/900/1100';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isLogin && form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      {/* left: brand panel (hidden on small screens) */}
      <aside className="auth-side">
        <img src={AUTH_IMG} alt="" />
        <div className="auth-side-text">
          <Link to="/" className="brand">Shopio<span>.</span></Link>
          <h2>Elevate your<br />everyday style.</h2>
          <p>Premium quality products crafted for comfort, style and performance.</p>
        </div>
      </aside>

      {/* right: form */}
      <section className="auth-main">
        <div className="auth-card">
          <Link to="/" className="brand auth-mobile-brand">Shopio<span>.</span></Link>

          <h1>{isLogin ? 'Welcome back' : 'Create your account'}</h1>
          <p className="auth-sub">
            {isLogin ? 'Log in to continue shopping.' : 'Join Shopio and start shopping in minutes.'}
          </p>

          <form onSubmit={submit} noValidate={false}>
            {error && <div className="auth-error" role="alert">{error}</div>}

            {!isLogin && (
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input id="name" required autoComplete="name" placeholder="Jane Doe" value={form.name} onChange={set('name')} />
              </div>
            )}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required autoComplete="email" placeholder="you@example.com" value={form.email} onChange={set('email')} />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="pw-wrap">
                <input
                  id="password"
                  type={show ? 'text' : 'password'}
                  required
                  minLength={6}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  placeholder={isLogin ? 'Enter your password' : 'At least 6 characters'}
                  value={form.password}
                  onChange={set('password')}
                />
                <button type="button" className="pw-toggle" onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
              </div>
            </div>

            {!isLogin && (
              <div className="field">
                <label htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={set('confirm')}
                />
              </div>
            )}

            <button className="btn auth-submit" disabled={busy}>
              {busy ? 'Please wait...' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <p className="auth-switch">
            {isLogin ? (
              <>Don’t have an account? <Link to="/register">Sign up</Link></>
            ) : (
              <>Already have an account? <Link to="/login">Log in</Link></>
            )}
          </p>
          <Link to="/" className="auth-back">← Back to store</Link>
        </div>
      </section>
    </div>
  );
}