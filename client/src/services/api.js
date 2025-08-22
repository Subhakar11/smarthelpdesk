import axios from 'axios'

// Always include /api in base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Ensure no double slashes
const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''), // removes trailing /
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // important if you use cookies
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
