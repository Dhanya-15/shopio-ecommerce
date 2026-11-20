import { createContext, useContext, useState } from 'react';
import { api } from '../api.js';
import { toast } from '../toast.js';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));

  const save = (u) => {
    if (u) localStorage.setItem('user', JSON.stringify(u));
    else localStorage.removeItem('user');
    setUser(u);
  };

  const login = async (email, password) => {
    const u = await api('/auth/login', { method: 'POST', body: { email, password } });
    save(u);
    toast(`Welcome back, ${u.name}! You are logged in.`);
  };

  const register = async (name, email, password) => {
    const u = await api('/auth/register', { method: 'POST', body: { name, email, password } });
    save(u);
    toast(`Account created. Welcome, ${u.name}! You are logged in.`);
  };

  const logout = () => {
    save(null);
    toast('You have been logged out.', 'info');
  };

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>;
}
