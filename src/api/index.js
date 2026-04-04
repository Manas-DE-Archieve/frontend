import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);
    return data;
  },
  register: async (email, password) => api.post('/auth/register', { email, password }),
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
  get: (params) => api.get('/facts', { params }),
  generate: () => api.post('/facts/generate'),
};

export const documentsApi = {
  checkDuplicates: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/check-duplicates', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  upload: (file, force = false) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`/documents/upload?force=${force}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
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
  // Users
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),

  // Documents moderation
  listPendingDocuments: (params) => api.get('/admin/pending-documents', { params }),
  verifyDocument: (id, status) => api.patch(`/admin/documents/${id}/verify`, { status }),

  // Persons moderation
  listPendingPersons: (params) => api.get('/admin/pending-persons', { params }),
  verifyPerson: (id, status) => api.patch(`/admin/persons/${id}/verify`, { status }),
};

export const setupApi = {
  setupSuperAdmin: (email, password) =>
    api.post('/auth/setup-super-admin', { email, password }),
};

// ── Voice API ──────────────────────────────────────────────────────────────────
const VOICE_BASE = '/voice';

export const voiceApi = {
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    const res = await fetch(`${VOICE_BASE}/transcribe-voice`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`ASR error: ${res.status}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error('ASR failed');
    const data = json.data;
    if (typeof data === 'string') return data;
    if (data?.text) return data.text;
    return JSON.stringify(data);
  },

  synthesize: async (text) => {
    const res = await fetch(`${VOICE_BASE}/generate-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) throw new Error(`TTS error: ${res.status}`);
    const blob = await res.blob();
    const audioBlob = new Blob([blob], { type: 'audio/mpeg' });
    return URL.createObjectURL(audioBlob);
  },
};

export default api;