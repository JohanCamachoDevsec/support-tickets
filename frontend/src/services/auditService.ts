import api from '@/lib/api';
import type { TicketHistory } from '@/types/TicketHistory';

export interface AuditFilters {
  userId?: number;
  field?: string;
  startDate?: string;
  endDate?: string;
}

export const auditService = {
  getGlobalAudit: async (filters?: AuditFilters): Promise<TicketHistory[]> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.userId) params.append('userId', filters.userId.toString());
      if (filters.field) params.append('field', filters.field);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
    }
    const response = await api.get<TicketHistory[]>(`/audit?${params.toString()}`);
    return response.data;
  },
};
