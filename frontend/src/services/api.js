import axios from 'axios'

// Express gateway base URL. Vite proxies /api → http://localhost:4000 in dev.
// Wired to real endpoints in Phase 5; nothing calls this yet.
export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// Unwrap the standard { success, message, data, error } envelope.
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const payload = error.response?.data
    return Promise.reject(payload?.error || payload?.message || error.message)
  }
)
