import api from './index.js';

export const tournamentApi = {
  createTournament: async (data) => {
    const response = await api.post('/tournaments', data);
    return response.data;
  },

  getTournaments: async () => {
    const response = await api.get('/tournaments');
    return response.data;
  },

  getTournament: async (tournamentId) => {
    const response = await api.get(`/tournaments/${tournamentId}`);
    return response.data;
  },

  createTournamentMatch: async (tournamentId, data) => {
    const response = await api.post(`/tournaments/${tournamentId}/matches`, data);
    return response.data;
  }
};

export default tournamentApi;
