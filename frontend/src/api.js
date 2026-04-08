import axios from 'axios';

const TOKEN_KEY = 'receiptai_token';
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    return;
  }
  localStorage.removeItem(TOKEN_KEY);
};

export const getAuthToken = () =>
  localStorage.getItem(TOKEN_KEY);

export const register = (payload) =>
  API.post('/auth/register', payload);

export const login = (payload) =>
  API.post('/auth/login', payload);

export const googleLogin = (idToken) =>
  API.post('/auth/google', { id_token: idToken });

export const getCurrentUser = () =>
  API.get('/auth/me');

export const logout = () =>
  API.post('/auth/logout');

export const scanReceipt = (imageBase64) =>
  API.post('/receipts/scan', { image: imageBase64 }, { timeout: 120000 });

export const getExpenses = (params) =>
  API.get('/expenses', { params });

export const deleteExpense = (id) =>
  API.delete(`/expenses/${id}`);

export const getBudget = () =>
  API.get('/budget');

export const updateBudget = (category, limit) =>
  API.put(`/budget/${encodeURIComponent(category)}`, { limit });

export const getBudgetConfig = () =>
  API.get('/settings/budget-config');

export const updateBudgetConfig = (categories) =>
  API.put('/settings/budget-config', { categories });

export const getAnalytics = () =>
  API.get('/analytics/summary');

export const getForecast = () =>
  API.get('/forecast');

export const getAnomalies = () =>
  API.get('/anomalies');

export const checkHealth = () =>
  API.get('/health');

export default API;
