import type { Response } from "express";
import type {AuthRequest} from "../middlewares/AuthMiddleware.js";
import { ticketHistoryService } from "../services/TicketHistoryService.js";
import { ticketService } from "../services/TicketService.js";
import { UserRole } from "../entities/User.js";
import { UnauthorizedError, NotFoundError, ForbiddenError } from "../errors/AppError.js";

/**
 * Controlador de Historial de Tickets.
 */
export class TicketHistoryController {
  /**
   * Obtiene el historial de un ticket específico.
   */
  async getTicketHistory(req: AuthRequest, res: Response): Promise<void> {
    const ticketId = parseInt(<string>req.params.id);

    // Si el usuario no está en req.user, ya lo filtró el middleware authenticate.
    if (!req.user) {
      throw new UnauthorizedError("No autorizado");
    }

    // El ticketService tiene un método getTicketById que ya filtra y hace comprobaciones.
    // Pero las reglas para el historial son: Visible para admins y agentes asignados al ticket.
    const ticket = await ticketService.getTicketById(ticketId, { id: req.user.userId, role: req.user.role } as any);

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    const isAdmin = req.user.role === UserRole.ADMIN;
    const isAssignedAgent = req.user.role === UserRole.AGENT && ticket.assignedTo?.id === req.user.userId;

    if (!isAdmin && !isAssignedAgent) {
      throw new ForbiddenError("No tienes permisos para ver el historial de este ticket");
    }

    const history = await ticketHistoryService.getTicketHistory(ticketId);
    res.json(history);
  }

  /**
   * Obtiene la auditoría global de todo el sistema.
   * Solo para administradores.
   */
  async getGlobalAudit(req: AuthRequest, res: Response): Promise<void> {
    const { userId, field, startDate, endDate } = req.query;

    const filters = {
      userId: userId ? parseInt(userId as string) : undefined,
      field: field as string,
      startDate: startDate as string,
      endDate: endDate as string
    };

    const history = await ticketHistoryService.getGlobalAudit(filters);
    res.json(history);
  }
}

export const ticketHistoryController = new TicketHistoryController();
