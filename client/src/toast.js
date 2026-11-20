// Popup messages. Call toast('text') from anywhere; <Toaster /> (in App.jsx) displays them.
let toasts = [];
let nextId = 0;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

export function toast(message, type = 'success') { // type: 'success' | 'info' | 'error'
  const t = { id: ++nextId, message, type };
  toasts = [...toasts.slice(-2), t];
  emit();
  setTimeout(() => { toasts = toasts.filter((x) => x.id !== t.id); emit(); }, 3000);
}

export const toastStore = {
  subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
  get: () => toasts,
};
