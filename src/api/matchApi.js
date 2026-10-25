import api from './index.js';

export const matchApi = {
  createMatch: async (data) => {
    const response = await api.post('/matches', data);
    return response.data;
  },

  getMatches: async (filters = {}) => {
    const response = await api.get('/matches', { params: filters });
    return response.data;
  },

  getMatch: async (matchId) => {
    const response = await api.get(`/matches/${matchId}`);
    return response.data;
  },

  setupMatch: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/setup`, data);
    return response.data;
  },

  startMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/start`, {});
    return response.data;
  },

  recordDelivery: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/deliveries`, data);
    return response.data;
  },

  undoDelivery: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/undo`, {});
    return response.data;
  },

  selectBatter: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/select-batter`, data);
    return response.data;
  },

  changeBowler: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/change-bowler`, data);
    return response.data;
  },

  startInnings: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/start-innings`, data);
    return response.data;
  },

  startSecondInnings: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/start-innings`, data);
    return response.data;
  },

  startSuperOver: async (matchId, data) => {
    const response = await api.post(`/matches/${matchId}/start-super-over`, data);
    return response.data;
  },

  completeMatch: async (matchId) => {
    const response = await api.post(`/matches/${matchId}/complete`, {});
    return response.data;
  },

  getScorecard: async (matchId) => {
    const response = await api.get(`/matches/${matchId}/scorecard`);
    return response.data;
  }
};

export default matchApi;
