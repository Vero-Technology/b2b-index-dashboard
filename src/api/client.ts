import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8001';

const client = axios.create({
  baseURL: API_BASE,
  timeout: 15_000,
});

client.interceptors.request.use((config) => {
  const key = localStorage.getItem('scrape_api_key') || 'your-secret-key-here';
  config.headers = config.headers ?? {};
  config.headers['X-Api-Key'] = key;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('scrape_api_key');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
