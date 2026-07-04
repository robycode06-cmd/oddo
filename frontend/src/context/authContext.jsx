import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../../axios_api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore non-sensitive user metadata on application load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (loginId, password) => {
    // Post request automatically receives the "token" cookie in the browser
    const response = await api.post('/login', { loginId, password });
    const { user: userData } = response.data;
    
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.post('/login/logout'); // Clears cookie on backend
    } catch (err) {
      console.error('Logout error on server', err);
    } finally {
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);