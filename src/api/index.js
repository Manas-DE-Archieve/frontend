import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
});

// Добавляем токен ко всем запросам
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  login: async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password });
    localStorage.setItem('access_token', res.data.access_token);
    localStorage.setItem('refresh_token', res.data.refresh_token);
    return res;
  },
  me: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

export const personsApi = {
  // list теперь принимает params (page, limit, q, region, status и т.д.)
  list: (params) => api.get('/api/persons', { params }),
  get: (id) => api.get(`/api/persons/${id}`),
  create: (data) => api.post('/api/persons', data),
  update: (id, data) => api.put(`/api/persons/${id}`, data),
  delete: (id) => api.delete(`/api/persons/${id}`),
  setStatus: (id, status) => api.patch(`/api/persons/${id}/status`, { status }),
};

export const documentsApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  // list теперь принимает params (page, limit)
  list: (params) => api.get('/api/documents', { params }),
  delete: (id) => api.delete(`/api/documents/${id}`),
};

export const chatApi = {
  createSession: () => api.post('/api/chat/sessions'),
  // listSessions также может принимать params для пагинации
  getSessions: (params) => api.get('/api/chat/sessions', { params }),
  getSessionMessages: (id) => api.get(`/api/chat/sessions/${id}`),
};

export default api;