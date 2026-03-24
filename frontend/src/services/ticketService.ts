import api from '@/lib/api';
import type {Ticket, CreateTicketDTO, AddCommentDTO, TicketComment, TicketStatus} from '@/types/Ticket';
import type { TicketHistory } from '@/types/TicketHistory';

export const ticketService = {
  getTickets: async (): Promise<Ticket[]> => {
    const response = await api.get<Ticket[]>('/tickets');
    return response.data;
  },

  getTicket: async (id: number): Promise<Ticket> => {
    const response = await api.get<Ticket>(`/tickets/${id}`);
    return response.data;
  },

  getTicketHistory: async (id: number): Promise<TicketHistory[]> => {
    const response = await api.get<TicketHistory[]>(`/tickets/${id}/history`);
    return response.data;
  },

  createTicket: async (data: CreateTicketDTO): Promise<Ticket> => {
    const response = await api.post<Ticket>('/tickets', data);
    return response.data;
  },

  addComment: async (id: number, data: AddCommentDTO): Promise<TicketComment> => {
    const response = await api.post<TicketComment>(`/tickets/${id}/comments`, data);
    return response.data;
  },

  changeStatus: async (id: number, status: TicketStatus): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${id}/status`, { status });
    return response.data;
  },

  updatePriority: async (id: number, priority: string): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${id}/priority`, { priority });
    return response.data;
  },

  assignTicket: async (id: number, agentId: number): Promise<Ticket> => {
    const response = await api.patch<Ticket>(`/tickets/${id}/assign`, { agentId });
    return response.data;
  },
};
