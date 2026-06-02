import api from './api';

// ── Authentication API calls ───────────────────────────────────
export const authService = {
  /**
   * POST /auth/signup
   * @param {{ name: string, email: string, password: string }} data
   * @returns {{ token: string, user: object }}
   */
  signup: async (data) => {
    const response = await api.post('/auth/signup', data);
    return response.data.data;
  },

  /**
   * POST /auth/login
   * @param {{ email: string, password: string }} data
   * @returns {{ token: string, user: object }}
   */
  login: async (data) => {
    const response = await api.post('/auth/login', data);
     return response.data.data;
  },
};