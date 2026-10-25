import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Add scorer token to requests when available
api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('scorerToken');
  if (token) {
    config.headers['x-scorer-token'] = token;
  }
  return config;
});

export default api;
