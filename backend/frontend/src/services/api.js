import axios from 'axios';

// Base API URL pointing to the local Laravel backend
const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

// Helper for persistent session ID (guest cart support)
const getSessionId = () => {
  let sessionId = localStorage.getItem('ikanku_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('ikanku_session_id', sessionId);
  }
  return sessionId;
};

// Request interceptor: attach Sanctum token and Session ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ikanku_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['X-Session-ID'] = getSessionId();
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401 unauth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired or unauthorized
      if (localStorage.getItem('ikanku_token')) {
        localStorage.removeItem('ikanku_token');
        localStorage.removeItem('ikanku_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
export { API_BASE_URL };
