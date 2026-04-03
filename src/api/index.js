import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
})

// Attach access token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      try {
        const refresh = localStorage.getItem('refresh_token')
        const { data } = await axios.post('/api/auth/refresh', null, { params: { token: refresh } })
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        original.headers.Authorization = `Bearer ${data.access_token}`
        return api(original)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('refresh_token', data.refresh_token)
    return data
  },
  me: () => api.get('/api/auth/me'),
  logout: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token') },
}

// ── Persons ───────────────────────────────────────────────
export const personsApi = {
  list: params => api.get('/api/persons', { params }),
  get: id => api.get(`/api/persons/${id}`),
  create: body => api.post('/api/persons', body),
  update: (id, body) => api.put(`/api/persons/${id}`, body),
  delete: id => api.delete(`/api/persons/${id}`),
  setStatus: (id, status) => api.patch(`/api/persons/${id}/status`, { status }),
}

// ── Documents ─────────────────────────────────────────────
export const documentsApi = {
  list: () => api.get('/api/documents'),
  upload: file => {
    const form = new FormData()
    form.append('file', file)
    return api.post('/api/documents/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  },
  delete: id => api.delete(`/api/documents/${id}`),
}

// ── Chat ──────────────────────────────────────────────────
export const chatApi = {
  createSession: () => api.post('/api/chat/sessions'),
  listSessions: () => api.get('/api/chat/sessions'),
  getMessages: sessionId => api.get(`/api/chat/sessions/${sessionId}`),
}

export default api
