import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
});

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

// ─── Voice API (speech-to-text & text-to-speech) ──────────────────────────────
// Base URL for the voice service. Set VITE_VOICE_API_URL in your .env
// e.g. VITE_VOICE_API_URL=http://localhost:8001
const VOICE_BASE = '/voice'

export const voiceApi = {
  /**
   * Send an audio Blob → returns transcribed text string.
   * Calls POST /transcribe-voice on the voice service.
   */
  transcribe: async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    const res = await fetch(`${VOICE_BASE}/transcribe-voice`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error(`ASR error: ${res.status}`);
    const json = await res.json();
    // The ASR service returns { status, data } where data may be string or { text: "..." }
    if (json.status !== 'success') throw new Error('ASR failed');
    const data = json.data;
    if (typeof data === 'string') return data;
    if (data?.text) return data.text;
    // Fallback: stringify whatever came back
    return JSON.stringify(data);
  },

  /**
   * Send text → returns a blob URL (string) for audio playback.
   * Calls POST /generate-voice on the voice service.
   * Caller is responsible for revoking the URL via URL.revokeObjectURL().
   */
  synthesize: async (text) => {
  const res = await fetch(`${VOICE_BASE}/generate-voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`TTS error: ${res.status}`);
  
  // Проверяем что реально получили аудио
  const contentType = res.headers.get('content-type');
  console.log('TTS content-type:', contentType);
  
  const blob = await res.blob();
  console.log('TTS blob size:', blob.size, 'type:', blob.type);
  
  // Принудительно указываем тип если сервер вернул неправильный
  const audioBlob = new Blob([blob], { type: 'audio/mpeg' });
  return URL.createObjectURL(audioBlob);
},
};

export const adminApi = {
  listUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
};

export const setupApi = {
  setupSuperAdmin: (email, password) =>
    api.post('/auth/setup-super-admin', { email, password }),
};

export default api;