import api from './api'

export const configAPI = {
  getConfig: () => api.get('/config'),
  updateConfig: (configData) => api.put('/config', configData)
}