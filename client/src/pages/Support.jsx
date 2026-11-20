import { useEffect, useState } from 'react';

// Replace with your own photo (e.g. put it in client/public and use '/contact.jpg')
const SUPPORT_IMG = 'src/images/help.jpg';
const EMAIL = 'hi@shopio.com';
const LOCATION = ['San Francisco,', 'California'];

const empty = { name: '', email: '', message: '' };

export default function Support() {
  const [form, setForm] = useState(empty);
  const [sent, setSent] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm(empty);
  };

  useEffect(() => {
    if (!sent) return;
    const onKey = (e) => e.key === 'Escape' && setSent(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sent]);

  return (
    <>
      <section className="contact">
        <img className="contact-img" src={SUPPORT_IMG} alt="" />

        <div>
          <h1>Contact Us</h1>
          <form className="contact-box" onSubmit={submit}>
            <div className="contact-fields">
              <label>Full Name
                <input required value={form.name} onChange={set('name')} />
              </label>
              <label>E-mail
                <input required type="email" value={form.email} onChange={set('email')} />
              </label>
              <label>Message
                <textarea required rows={2} value={form.message} onChange={set('message')} />
              </label>
              <button className="btn contact-btn">Contact Us</button>
            </div>

            <div className="contact-info">
              <h3>Contact</h3>
              <p>{EMAIL}</p>
              <h3>Based in</h3>
              <p>{LOCATION[0]}<br />{LOCATION[1]}</p>
            </div>
          </form>
        </div>
      </section>

      {sent && (
        <div className="modal-overlay" onClick={() => setSent(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-check">✓</div>
            <p>We got your query, it will be resolved soon. Thank You</p>
            <button className="btn" onClick={() => setSent(false)}>OK</button>
          </div>
        </div>
      )}
    </>
  );
}