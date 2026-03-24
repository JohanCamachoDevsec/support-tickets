import { AppDataSource } from "../config/database.js";
import { Ticket, TicketStatus, TicketPriority } from "../entities/Ticket.js";
import { TicketComment } from "../entities/TicketComment.js";
import { User, UserRole } from "../entities/User.js";
import type { Repository, FindManyOptions } from "typeorm";
import { ForbiddenError, NotFoundError, BusinessRuleError } from "../errors/AppError.js";

/**
 * Servicio encargado de gestionar la lógica de negocio de los Tickets.
 * Implementa el patrón Repository para la persistencia y encapsula las reglas de negocio
 * como las transiciones de estado y la auditoría.
 */
export class TicketService {
  private repository: Repository<Ticket>;

  constructor() {
    // Obtenemos el repositorio desde el AppDataSource configurado con TypeORM.
    this.repository = AppDataSource.getRepository(Ticket);
  }

  /**
   * Crea un nuevo ticket.
   * siempre inician en estado OPEN.
   *
   * @param data Datos básicos del ticket (título, descripción, prioridad)
   * @param creator Usuario que reporta el ticket (CLIENT o ADMIN)
   * @returns El ticket persistido en la base de datos
   */
  async createTicket(data: { title: string; description: string; priority: TicketPriority }, creator: User): Promise<Ticket> {
    const ticket = this.repository.create({
      ...data,
      createdBy: creator,
      status: TicketStatus.OPEN
    });

    return await this.repository.save(ticket);
  }

  /**
   * Recupera los tickets según el rol del usuario.
   * Los usuarios ADMIN y AGENT ven todos, los CLIENT solo ven los suyos.
   *
   * @param user Usuario que realiza la consulta
   */
  async getAllTickets(user: User): Promise<Ticket[]> {
    const queryOptions: FindManyOptions<Ticket> = {
      relations: ["createdBy", "assignedTo"]
    };

    // Aplicar filtrado
    if (user.role === UserRole.CLIENT) {
      queryOptions.where = { createdBy: { id: user.id } };
    }

    return await this.repository.find(queryOptions);
  }

  /**
   * Los usuarios CLIENT solo pueden ver sus propios tickets.
   */
  async getTicketById(id: number, user: User): Promise<Ticket | null> {
    const ticket = await this.repository.findOne({
      where: { id },
      relations: ["createdBy", "assignedTo", "comments", "comments.author", "history", "history.changedBy"]
    });

    if (!ticket) return null;

    //  Validar propiedad para CLIENT
    if (user.role === UserRole.CLIENT && ticket.createdBy.id !== user.id) {
      throw new ForbiddenError("No tienes permisos para ver este ticket.");
    }

    // Filtrar comentarios internos si es CLIENT
    if (user.role === UserRole.CLIENT && ticket.comments) {
      ticket.comments = ticket.comments.filter(comment => !comment.isInternal);
    }

    return ticket;
  }

  /**
   * Gestiona el flujo de trabajo de estados de un ticket mediante una máquina de estados.
   * Las transiciones permitidas están definidas en TRANSITION_MAP.
   *
   * @param ticketId ID del ticket a actualizar
   * @param nextStatus El siguiente estado deseado
   * @param user El usuario que está realizando la acción (para auditoría en TicketHistory)
   */
  async changeStatus(ticketId: number, nextStatus: TicketStatus, user: User): Promise<Ticket> {
    const ticket = await this.repository.findOne({
      where: { id: ticketId },
      relations: ["createdBy"]
    });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    //  Validaciones de rol para cambio de estado
    if (user.role === UserRole.CLIENT) {
      // Un cliente solo actúa sobre sus propios tickets
      if (ticket.createdBy.id !== user.id) {
        throw new ForbiddenError("No puedes modificar tickets de otros usuarios.");
      }

      // Un cliente solo puede reabrir un ticket cerrado
      if (nextStatus !== TicketStatus.REOPENED) {
        throw new BusinessRuleError("Los clientes solo pueden reabrir tickets.");
      }
    }

    // Los AGENTES y ADMINS pueden cambiar estados, pero validamos la máquina de estados.
    if (!this.isValidTransition(ticket.status, nextStatus)) {
      throw new BusinessRuleError(`Intento ilegal de cambiar de ${ticket.status} a ${nextStatus}.`, "INVALID_STATUS_TRANSITION");
    }

    // Aplicar cambio y metadatos de auditoría
    ticket.status = nextStatus;
    ticket.updatedBy = user;

    return await this.repository.save(ticket);
  }

  /**
   * Actualiza la prioridad de un ticket.
   * Solo ADMIN y AGENT tienen permiso.
   */
  async updatePriority(ticketId: number, newPriority: TicketPriority, user: User): Promise<Ticket> {
    const ticket = await this.repository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError("Ticket");

    if (user.role === UserRole.CLIENT) {
      throw new ForbiddenError("Los clientes no pueden cambiar la prioridad.");
    }

    ticket.priority = newPriority;
    ticket.updatedBy = user;

    return await this.repository.save(ticket);
  }

  /**
   * Asigna un ticket a un agente específico.
   * Solo los administradores pueden asignar tickets.
   */
  async assignTicket(ticketId: number, agent: User, admin: User): Promise<Ticket> {
    const ticket = await this.repository.findOne({ where: { id: ticketId } });
    if (!ticket) throw new NotFoundError("Ticket");

    if (admin.role !== UserRole.ADMIN) {
      throw new ForbiddenError("Solo los administradores pueden asignar tickets.");
    }

    ticket.assignedTo = agent;
    ticket.updatedBy = admin;

    return await this.repository.save(ticket);
  }

  /**
   * Añade un comentario a un ticket.
   * Los CLIENT solo pueden comentar en sus propios tickets y no pueden marcar comentarios como internos.
   * Los AGENT y ADMIN pueden crear comentarios internos para comunicación interna del equipo.
   *
   * @param ticketId ID del ticket
   * @param data Contenido y flag de privacidad del comentario
   * @param user Usuario que realiza el comentario
   */
  async addComment(ticketId: number, data: { content: string; isInternal?: boolean }, user: User): Promise<TicketComment> {
    const ticket = await this.repository.findOne({
      where: { id: ticketId },
      relations: ["createdBy"]
    });

    if (!ticket) {
      throw new NotFoundError("Ticket");
    }

    // Validar propiedad para CLIENT
    if (user.role === UserRole.CLIENT && ticket.createdBy.id !== user.id) {
      throw new ForbiddenError("No puedes comentar en tickets ajenos.");
    }

    const commentRepository = AppDataSource.getRepository(TicketComment);

    // Regla de Negocio: Solo personal de soporte (AGENT/ADMIN) puede crear comentarios internos.
    const isInternal = (user.role === UserRole.AGENT || user.role === UserRole.ADMIN)
      ? (data.isInternal ?? false)
      : false;

    const comment = commentRepository.create({
      content: data.content,
      isInternal,
      author: user,
      ticket: ticket
    });

    return await commentRepository.save(comment);
  }

  /**
   * Mapa de transiciones permitidas (Máquina de estados).
   * Define el grafo de estados del sistema para una gestión determinista del ciclo de vida del ticket.
   */
  private readonly TRANSITION_MAP: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.IN_PROGRESS]: [TicketStatus.CLOSED],
    [TicketStatus.CLOSED]: [TicketStatus.REOPENED],
    [TicketStatus.REOPENED]: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED]
  };

  /**
   * Regla de negocio: Válida si la transición de estado es permitida según el grafo definido.
   *
   * @param current Estado actual del ticket
   * @param next Estado al que se desea transition
   */
  private isValidTransition(current: TicketStatus, next: TicketStatus): boolean {
    const allowed = this.TRANSITION_MAP[current] || [];
    return allowed.includes(next);
  }
}

// Exportamos una instancia única para ser consumida por los controladores.
export const ticketService = new TicketService();
