import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Custom hook for easy auth context access
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}