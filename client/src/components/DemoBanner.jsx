import { useEffect, useState, useSyncExternalStore } from 'react';
import { demo } from '../demo.js';
import { API_URL } from '../api.js';
import { toast } from '../toast.js';

// Shows a popup when demo mode switches on, plus a small "Demo mode" tag that reopens it.
export default function DemoBanner() {
  const active = useSyncExternalStore(demo.subscribe, () => demo.active);
  const [open, setOpen] = useState(false);

  useEffect(() => { if (active) setOpen(true); }, [active]);

  if (!active) return null;

  const retry = async () => {
    try {
      const r = await fetch(`${API_URL}/api/products`);
      if (r.ok) return window.location.reload();
    } catch { /* still down */ }
    toast('The database is still unavailable', 'error');
  };

  return (
    <>
      <button className="demo-pill" onClick={() => setOpen(true)}>Demo mode</button>
      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <div className="modal-check warn">!</div>
            <h3>Demo mode activated</h3>
            <p>We could not reach the database, so the website is showing sample data. Orders and changes will not be saved.</p>
            <div className="modal-actions">
              <button className="btn" onClick={() => setOpen(false)}>Continue in demo mode</button>
              <button className="btn btn-light" onClick={retry}>Retry connection</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
