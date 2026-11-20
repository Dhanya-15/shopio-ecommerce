export async function api(path, { method = 'GET', body } = {}) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(user?.token ? { Authorization: `Bearer ${user.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Uploads an image file from the admin's computer and returns its URL.
export async function uploadImage(file) {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
    body: fd,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Image upload failed');
  return data.url;
}

export const money = (n) => `$${Number(n).toFixed(2)}`;