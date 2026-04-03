import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

// Автоматически добавляем токен ко всем запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  },
  register: async (email, password) => {
    return api.post('/auth/register', { email, password });
  },
  me: () => api.get('/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const personsApi = {
  list: (params) => api.get('/persons', { params }),
  get: (id) => api.get(`/persons/${id}`),
  regionStats: () => api.get('/persons/stats/regions'),
  create: (data) => api.post('/persons', data),
  update: (id, data) => api.put(`/persons/${id}`, data),
  delete: (id) => api.delete(`/persons/${id}`),
  setStatus: (id, status) => api.patch(`/persons/${id}/status`, { status }),
  extract: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/persons/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const factsApi = {
  get: () => api.get('/facts'),
};

export const documentsApi = {
  checkDuplicates: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/check-duplicates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (params) => api.get('/documents', { params }),
  get: (id) => api.get(`/documents/${id}`),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const chatApi = {
  createSession: () => api.post('/chat/sessions'),
  listSessions: (params) => api.get('/chat/sessions', { params }),
  getMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}`),
};

export const adminApi = {
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
};

export default api;