import type { Response } from "express";
import type {AuthRequest} from "../middlewares/AuthMiddleware.js";
import { ticketHistoryService } from "../services/TicketHistoryService.js";
import { ticketService } from "../services/TicketService.js";
import { UserRole } from "../entities/User.js";

/**
 * Controlador de Historial de Tickets.
 */
export class TicketHistoryController {
  /**
   * Obtiene el historial de un ticket específico.
   */
  async getTicketHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ticketId = parseInt(<string>req.params.id);
      const user = (req as any).userEntity; // Asumimos que un middleware previo añade la entidad User completa o necesitamos buscarla

      // Verificamos el ticket y permisos
      // Nota: ticketService.getTicketById ya maneja permisos básicos de CLIENT,
      // pero aquí necesitamos validar específicamente para ADMIN o AGENTE ASIGNADO
      // aunque el ticketService ya tiene lógica de recuperación de relaciones.

      // Para simplificar, buscaremos el ticket primero para validar permisos
      // Si el usuario no está en req.user, ya lo filtró el middleware authenticate.
      if (!req.user) {
         res.status(401).json({ error: "No autorizado" });
         return;
      }

      // El ticketService tiene un método getTicketById que ya filtra y hace comprobaciones.
      // Pero las reglas para el historial son: Visible para admins y agentes asignados al ticket.
      const ticket = await ticketService.getTicketById(ticketId, { id: req.user.userId, role: req.user.role } as any);

      if (!ticket) {
        res.status(404).json({ error: "Ticket no encontrado" });
        return;
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const isAssignedAgent = req.user.role === UserRole.AGENT && ticket.assignedTo?.id === req.user.userId;

      if (!isAdmin && !isAssignedAgent) {
        res.status(403).json({ error: "No tienes permisos para ver el historial de este ticket" });
        return;
      }

      const history = await ticketHistoryService.getTicketHistory(ticketId);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Obtiene la auditoría global de todo el sistema.
   * Solo para administradores.
   */
  async getGlobalAudit(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, field, startDate, endDate } = req.query;

      const filters = {
        userId: userId ? parseInt(userId as string) : undefined,
        field: field as string,
        startDate: startDate as string,
        endDate: endDate as string
      };

      const history = await ticketHistoryService.getGlobalAudit(filters);
      res.json(history);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export const ticketHistoryController = new TicketHistoryController();
