import React, { createContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';

export const AuthContext = createContext(null);

const STORAGE_KEY = 'mm_auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applyToken = (token) => {
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  };

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        applyToken(parsed.token);
        setUser(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (name, password) => {
    const { data } = await axios.post('/api/auth/login', { name, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    applyToken(data.token);
    setUser(data);
    return data;
  };

  const logout = useCallback(async () => {
    try { await axios.post('/api/auth/logout'); } catch { /* 이미 만료된 세션 */ }
    localStorage.removeItem(STORAGE_KEY);
    applyToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
