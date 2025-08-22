import api from './api'

export const ticketsAPI = {
  getTickets: (params = '') => {
    // Remove any extra /tickets from the beginning of params
    let cleanParams = params;
    if (params.startsWith('/tickets')) {
      cleanParams = params.replace('/tickets', '');
    }
    return api.get(`/tickets${cleanParams}`);
  },
  getTicket: (id) => api.get(`/tickets/${id}`),
  createTicket: (ticketData) => api.post('/tickets', ticketData),
  updateTicket: (id, ticketData) => api.put(`/tickets/${id}`, ticketData),
  sendReply: (id, replyData) => api.post(`/tickets/${id}/reply`, replyData)
}