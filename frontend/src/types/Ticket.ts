import type {User} from './User';

export const TicketStatus = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  CLOSED: 'CLOSED',
  REOPENED: 'REOPENED',
} as const;

export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;

export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

export interface TicketComment {
  id: number;
  content: string;
  isInternal: boolean;
  author: User;
  createdAt: string;
}

export interface Ticket {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdBy: User;
  assignedTo: User | null;
  comments: TicketComment[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority?: TicketPriority;
}

export interface AddCommentDTO {
  content: string;
  isInternal?: boolean;
}
