import api from './api';

// ── URL CRUD and Analytics API calls ──────────────────────────
export const urlService = {
  /**
   * GET /urls — fetch all URLs for the current user
   */
  getUrls: async () => {
    const response = await api.get('/urls');
    return response.data;
  },

  /**
   * POST /urls — create a new short URL
   * @param {{ originalUrl, customAlias?, expiresAt? }} data
   */
  createUrl: async (data) => {
    const response = await api.post('/urls', data);
    return response.data;
  },

  /**
   * PUT /urls/:id — update an existing URL
   * @param {string} id
   * @param {{ originalUrl?, customAlias?, expiresAt? }} data
   */
  updateUrl: async (id, data) => {
    const response = await api.put(`/urls/${id}`, data);
    return response.data;
  },

  /**
   * DELETE /urls/:id — delete a URL
   * @param {string} id
   */
  deleteUrl: async (id) => {
    const response = await api.delete(`/urls/${id}`);
    return response.data;
  },

  /**
   * GET /urls/:id/analytics — get analytics for a URL
   * @param {string} id
   */
  getAnalytics: async (id) => {
    const response = await api.get(`/analytics/${id}`);
    return response.data;
  },
};