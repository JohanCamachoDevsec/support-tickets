import type { User } from './User';
import type { Ticket } from './Ticket';

export interface TicketHistory {
  id: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: User;
  ticket: Ticket;
  createdAt: string;
}
