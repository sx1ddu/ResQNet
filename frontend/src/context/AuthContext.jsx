import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setAccessToken, setOnRefreshFailed, setOnAccessTokenRefreshed } from '../api/axiosClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setCurrentAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
    setCurrentAccessToken(null);
    setAccessToken(null);
  }, []);

  useEffect(() => {
    setOnRefreshFailed(clearSession);
    setOnAccessTokenRefreshed(setCurrentAccessToken);

    (async () => {
      try {
        const { data } = await api.post('/auth/refresh');
        setAccessToken(data.accessToken);
        setCurrentAccessToken(data.accessToken);
        const me = await api.get('/auth/me');
        setUser(me.data.user);
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    })();
  }, [clearSession]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken);
    setCurrentAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setAccessToken(data.accessToken);
    setCurrentAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      clearSession();
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
