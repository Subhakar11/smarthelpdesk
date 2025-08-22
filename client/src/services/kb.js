import api from './api'

export const kbAPI = {
  getArticles: (query = '') => {
    const url = query ? `/kb?query=${encodeURIComponent(query)}` : '/kb'
    return api.get(url)
  },
  getArticle: (id) => api.get(`/kb/${id}`),
  createArticle: (articleData) => api.post('/kb', articleData),
  updateArticle: (id, articleData) => api.put(`/kb/${id}`, articleData),
  deleteArticle: (id) => api.delete(`/kb/${id}`)
}