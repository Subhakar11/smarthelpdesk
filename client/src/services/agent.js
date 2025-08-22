import api from './api'

export const agentAPI = {
  getSuggestion: (ticketId) => api.get(`/agent/suggestion/${ticketId}`),
  triageTicket: (ticketId) => api.post(`/agent/triage/${ticketId}`)
}