import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../lib/axiosInstance';
import safeParseJson from '../utils/safeParseJson';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('passenger_token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('passenger_token');
      if (token) {
        setAccessToken(token);
        try {
          // optional: load profile if backend provides /api/auth/me
          const res = await axiosInstance.get('/api/auth/me');
          const data = res?.data;
          if (data) setUser(data);
        } catch (e) {
          // ignore
        }
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await safeParseJson(res);
      const token = data?.access_token || data?.accessToken || data?.token;
      if (!token) throw new Error(data?.message || 'No token returned from login');
      localStorage.setItem('passenger_token', token);
      setAccessToken(token);
      if (data.user) setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('passenger_token');
    setAccessToken(null);
    setUser(null);
  };

  const refreshToken = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // credentials: 'include' // uncomment if refresh uses httpOnly cookie
      });
      if (!res.ok) throw new Error('Refresh failed');
      const data = await safeParseJson(res);
      const token = data?.access_token || data?.accessToken || data?.token;
      if (token) {
        localStorage.setItem('passenger_token', token);
        setAccessToken(token);
        return token;
      }
      throw new Error('No token on refresh');
    } catch (e) {
      logout();
      throw e;
    }
  };

  const getAccessToken = () => accessToken || localStorage.getItem('passenger_token');

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshToken, getAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
