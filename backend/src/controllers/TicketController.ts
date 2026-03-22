import type { Response } from "express";
import { ticketService } from "../services/TicketService.js";
import { AppDataSource } from "../config/database.js";
import { User } from "../entities/User.js";
import type { AuthRequest } from "../middlewares/AuthMiddleware.js";
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
  if (!req.user) throw new Error("No autenticado");
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id: req.user.userId });
  if (!user) throw new Error("Usuario no encontrado en la base de datos");
  return user;
};

/**
 * Controlador para la gestión de tickets.
 */
export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = createTicketSchema.parse(req.body);
    const user = await getUserEntity(req);
    const ticket = await ticketService.createTicket(validatedData, user);
    res.status(201).json(ticket);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const getTickets = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserEntity(req);
    const tickets = await ticketService.getAllTickets(user);
    res.json(tickets);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await getUserEntity(req);
    const ticket = await ticketService.getTicketById(Number(id), user);
    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });
    res.json(ticket);
  } catch (error: any) {
    res.status(403).json({ error: error.message });
  }
};

export const changeStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = changeStatusSchema.parse(req.body);
    const user = await getUserEntity(req);
    const ticket = await ticketService.changeStatus(Number(id), validatedData.status, user);
    res.json(ticket);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const updatePriority = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updatePrioritySchema.parse(req.body);
    const user = await getUserEntity(req);
    const ticket = await ticketService.updatePriority(Number(id), validatedData.priority, user);
    res.json(ticket);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = addCommentSchema.parse(req.body);
    const user = await getUserEntity(req);
    const comment = await ticketService.addComment(Number(id), validatedData, user);
    res.status(201).json(comment);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};

export const assignTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = assignTicketSchema.parse(req.body);
    const admin = await getUserEntity(req);

    const userRepository = AppDataSource.getRepository(User);
    const agent = await userRepository.findOneBy({ id: validatedData.agentId });
    if (!agent) return res.status(404).json({ error: "Agente no encontrado" });

    const ticket = await ticketService.assignTicket(Number(id), agent, admin);
    res.json(ticket);
  } catch (error: any) {
    if (error.errors) return res.status(400).json({ error: error.errors[0].message });
    res.status(400).json({ error: error.message });
  }
};
