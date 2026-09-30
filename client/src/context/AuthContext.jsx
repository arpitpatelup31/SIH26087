import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoAccounts, setDemoAccounts] = useState([]);

  // Fetch initial profile if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            setAuthToken(null);
          }
        } catch (err) {
          console.warn('Session expired or invalid, logging out', err);
          setAuthToken(null);
          setUser(null);
        }
      }
      
      // Load demo accounts for quick role switcher
      try {
        const demoRes = await authApi.getDemoAccounts();
        if (demoRes.success) {
          setDemoAccounts(demoRes.users || []);
        }
      } catch (e) {
        console.warn('Could not load demo accounts', e);
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login(email, password);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
  };

  // Quick Demo Role Switcher helper
  const switchDemoUser = async (roleName) => {
    const defaultCredentials = {
      student: { email: 'ramesh.patel@coopconnect.in', pass: 'password123' },
      student2: { email: 'sunita.sharma@coopconnect.in', pass: 'password123' },
      trainer: { email: 'prof.sharma@coopconnect.in', pass: 'trainer123' },
      admin: { email: 'admin@coopconnect.in', pass: 'admin123' }
    };

    const creds = defaultCredentials[roleName] || defaultCredentials.student;
    return await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      demoAccounts,
      switchDemoUser,
      isAuthenticated: !!user,
      isStudent: user?.role_name === 'student',
      isTrainer: user?.role_name === 'trainer' || user?.role_name === 'admin',
      isAdmin: user?.role_name === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
