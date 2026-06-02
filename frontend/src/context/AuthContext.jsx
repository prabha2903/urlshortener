import React, { createContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

// Create the context
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true during initial token check

  // ── On mount: check for existing JWT in localStorage ──────────
  useEffect(() => {
    const token = localStorage.getItem('linksnap_token');
    const savedUser = localStorage.getItem('linksnap_user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        // Corrupted data — clear it
        localStorage.removeItem('linksnap_token');
        localStorage.removeItem('linksnap_user');
      }
    }
    setLoading(false);
  }, []);

  // ── Login ──────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    // Store token and user in localStorage
    localStorage.setItem('linksnap_token', data.token);
    localStorage.setItem('linksnap_user',  JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Welcome back, ${data.user.name}! 👋`);
    return data;
  }, []);

  // ── Signup ─────────────────────────────────────────────────────
  const signup = useCallback(async (name, email, password) => {
    const data = await authService.signup({ name, email, password });
    localStorage.setItem('linksnap_token', data.token);
    localStorage.setItem('linksnap_user',  JSON.stringify(data.user));
    setUser(data.user);
    toast.success(`Account created! Welcome, ${data.user.name} 🎉`);
    return data;
  }, []);

  // ── Logout ─────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('linksnap_token');
    localStorage.removeItem('linksnap_user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}