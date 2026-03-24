import type { Response } from "express";
import { ticketService } from "../services/TicketService.js";
import { AppDataSource } from "../config/database.js";
import { User, UserRole } from "../entities/User.js";
import type { AuthRequest } from "../middlewares/AuthMiddleware.js";
import { UnauthorizedError, NotFoundError, BusinessRuleError } from "../errors/AppError.js";
import {
  createTicketSchema,
  changeStatusSchema,
  updatePrioritySchema,
  addCommentSchema,
  assignTicketSchema
} from "../validations/TicketValidation.js";

/**
 * Helper para obtener la entidad User desde la base de datos
 */
const getUserEntity = async (req: AuthRequest): Promise<User> => {
  if (!req.user) throw new UnauthorizedError("No autenticado");
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id: req.user.userId });
  if (!user) throw new NotFoundError("Usuario");
  return user;
};

/**
 * Controlador para la gestión de tickets.
 */
export const createTicket = async (req: AuthRequest, res: Response) => {
  const validatedData = createTicketSchema.parse(req.body);
  const user = await getUserEntity(req);
  const ticket = await ticketService.createTicket(validatedData, user);
  res.status(201).json(ticket);
};

export const getTickets = async (req: AuthRequest, res: Response) => {
  const user = await getUserEntity(req);
  const tickets = await ticketService.getAllTickets(user);
  res.json(tickets);
};

export const getTicket = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = await getUserEntity(req);
  const ticket = await ticketService.getTicketById(Number(id), user);
  if (!ticket) throw new NotFoundError("Ticket");
  res.json(ticket);
};

export const changeStatus = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = changeStatusSchema.parse(req.body);
  const user = await getUserEntity(req);
  const ticket = await ticketService.changeStatus(Number(id), validatedData.status, user);
  res.json(ticket);
};

export const updatePriority = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = updatePrioritySchema.parse(req.body);
  const user = await getUserEntity(req);
  const ticket = await ticketService.updatePriority(Number(id), validatedData.priority, user);
  res.json(ticket);
};

export const addComment = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = addCommentSchema.parse(req.body);
  const user = await getUserEntity(req);
  const comment = await ticketService.addComment(Number(id), validatedData, user);
  res.status(201).json(comment);
};

export const assignTicket = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const validatedData = assignTicketSchema.parse(req.body);
  const admin = await getUserEntity(req);

  const userRepository = AppDataSource.getRepository(User);
  const agent = await userRepository.findOneBy({ id: validatedData.agentId });
  if (!agent || agent.role !== UserRole.AGENT) {
    throw new BusinessRuleError("Solo se puede asignar tickets a usuarios con rol AGENTE");
  }

  const ticket = await ticketService.assignTicket(Number(id), agent, admin);
  res.json(ticket);
};
