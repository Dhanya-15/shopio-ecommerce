import { demo, demoApi } from './demo.js';

// Calls the API. If the server/database can't be reached, demo mode switches on automatically.
export async function api(path, opts = {}) {
  if (demo.active) return demoApi(path, opts);

  const { method = 'GET', body } = opts;
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  let res;
  let data;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    data = await res.json().catch(() => null);
  } catch {
    demo.activate(); // server not reachable
    return demoApi(path, opts);
  }

  const serverDown = (data === null && res.status >= 500) || [502, 503, 504].includes(res.status) || data?.demo;
  if (serverDown) {
    demo.activate();
    return demoApi(path, opts);
  }
  if (!res.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

// Uploads an image file from the admin's computer and returns its URL.
export async function uploadImage(file) {
  if (demo.active) return URL.createObjectURL(file);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const fd = new FormData();
  fd.append('image', file);
  let res;
  let data;
  try {
    res = await fetch('/api/upload', {
      method: 'POST',
      headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      body: fd,
    });
    data = await res.json().catch(() => null);
  } catch {
    demo.activate();
    return URL.createObjectURL(file);
  }
  if ((data === null && res.status >= 500) || res.status === 503 || data?.demo) {
    demo.activate();
    return URL.createObjectURL(file);
  }
  if (!res.ok) throw new Error(data?.message || 'Image upload failed');
  return data.url;
}

export const money = (n) => `$${Number(n).toFixed(2)}`;
