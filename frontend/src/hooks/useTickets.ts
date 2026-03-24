import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '@/services/ticketService';
import type { CreateTicketDTO, AddCommentDTO, TicketStatus } from '@/types/Ticket';

export const useTickets = () => {
  const queryClient = useQueryClient();

  const useGetTickets = () => {
    return useQuery({
      queryKey: ['tickets'],
      queryFn: ticketService.getTickets,
    });
  };

  const useGetTicket = (id: number) => {
    return useQuery({
      queryKey: ['ticket', id],
      queryFn: () => ticketService.getTicket(id),
      enabled: !!id,
    });
  };

  const useGetTicketHistory = (id: number) => {
    return useQuery({
      queryKey: ['ticketHistory', id],
      queryFn: () => ticketService.getTicketHistory(id),
      enabled: !!id,
    });
  };

  const useCreateTicket = () => {
    return useMutation({
      mutationFn: (data: CreateTicketDTO) => ticketService.createTicket(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      },
    });
  };

  const useAddComment = (ticketId: number) => {
    return useMutation({
      mutationFn: (data: AddCommentDTO) => ticketService.addComment(ticketId, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      },
    });
  };

  const useChangeStatus = (ticketId: number) => {
    return useMutation({
      mutationFn: (status: TicketStatus) => ticketService.changeStatus(ticketId, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      },
    });
  };

  const useUpdatePriority = (ticketId: number) => {
    return useMutation({
      mutationFn: (priority: string) => ticketService.updatePriority(ticketId, priority),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      },
    });
  };

  const useAssignTicket = (ticketId: number) => {
    return useMutation({
      mutationFn: (agentId: number) => ticketService.assignTicket(ticketId, agentId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
        queryClient.invalidateQueries({ queryKey: ['tickets'] });
      },
    });
  };

  return {
    useGetTickets,
    useGetTicket,
    useGetTicketHistory,
    useCreateTicket,
    useAddComment,
    useChangeStatus,
    useUpdatePriority,
    useAssignTicket,
  };
};
