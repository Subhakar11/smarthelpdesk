import api from './api'

export const auditAPI = {
  getAuditLogs: (ticketId) => api.get(`/audit/ticket/${ticketId}`)
}