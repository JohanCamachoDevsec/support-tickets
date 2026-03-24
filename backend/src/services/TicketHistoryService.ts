import { AppDataSource } from "../config/database.js";
import { TicketHistory } from "../entities/TicketHistory.js";
import { UserRole } from "../entities/User.js";
import type { Repository, FindManyOptions } from "typeorm";
import { Between, Like } from "typeorm";

/**
 * Servicio encargado de gestionar el historial de auditoría de los Tickets.
 */
export class TicketHistoryService {
  private repository: Repository<TicketHistory>;

  constructor() {
    this.repository = AppDataSource.getRepository(TicketHistory);
  }

  /**
   * Recupera el historial de un ticket específico.
   * Visible para admins y agentes asignados.
   *
   * @param ticketId ID del ticket
   */
  async getTicketHistory(ticketId: number): Promise<TicketHistory[]> {
    return await this.repository.find({
      where: { ticket: { id: ticketId } },
      relations: ["changedBy", "ticket"],
      order: { createdAt: "DESC" }
    });
  }

  /**
   * Recupera el historial global de auditoría con filtros.
   * Solo para admins.
   *
   * @param filters Filtros de búsqueda (usuario, fecha, campo)
   */
  async getGlobalAudit(filters?: { userId?: number; startDate?: string; endDate?: string; field?: string }): Promise<TicketHistory[]> {
    const queryOptions: FindManyOptions<TicketHistory> = {
      relations: ["changedBy", "ticket"],
      order: { createdAt: "DESC" },
      where: {}
    };

    if (filters) {
      if (filters.userId) {
        queryOptions.where = { ...queryOptions.where as object, changedBy: { id: filters.userId } };
      }
      if (filters.field) {
        queryOptions.where = { ...queryOptions.where as object, field: Like(`%${filters.field}%`) };
      }
      if (filters.startDate && filters.endDate) {
        queryOptions.where = {
          ...queryOptions.where as object,
          createdAt: Between(new Date(filters.startDate), new Date(filters.endDate))
        };
      } else if (filters.startDate) {
        // Si solo hay fecha de inicio, buscamos desde esa fecha hasta hoy
        queryOptions.where = {
          ...queryOptions.where as object,
          createdAt: Between(new Date(filters.startDate), new Date())
        };
      }
    }

    return await this.repository.find(queryOptions);
  }
}

export const ticketHistoryService = new TicketHistoryService();
