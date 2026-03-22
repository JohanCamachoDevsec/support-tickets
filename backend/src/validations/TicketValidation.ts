import { z } from "zod";
import { TicketStatus, TicketPriority } from "../entities/Ticket.js";

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(5, { error: "El título debe tener al menos 5 caracteres" })
    .max(100, { error: "El título es demasiado largo" }),
  description: z
    .string()
    .min(10, { error: "La descripción debe tener al menos 10 caracteres" }),
  priority: z.enum(TicketPriority).optional().default(TicketPriority.MEDIUM)
});

export const changeStatusSchema = z.object({
  status: z.enum(TicketStatus, {
    error: "Estado de ticket no válido"
  })
});

export const updatePrioritySchema = z.object({
  priority: z.enum(TicketPriority, {
    error: "Prioridad de ticket no válida"
  })
});

export const addCommentSchema = z.object({
  content: z.string().min(1, { error: "El comentario no puede estar vacío" }),
  isInternal: z.boolean().optional().default(false)
});

export const assignTicketSchema = z.object({
  agentId: z.number({ error: "El ID del agente debe ser un número válido" })
});
