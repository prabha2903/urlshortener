import axios from 'axios';
import toast from 'react-hot-toast';

// ── Centralized Axios instance ─────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15s timeout
});

// ── Request Interceptor: attach JWT token ──────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('linksnap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor: global error handling ────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    if (status === 401) {
      // Token expired or invalid — force logout
      localStorage.removeItem('linksnap_token');
      localStorage.removeItem('linksnap_user');
      toast.error('Session expired. Please log in again.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('You do not have permission to do this.');
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject({ message, status });
  }
);

export default api;