import { Router } from "express";
import * as ticketController from "../controllers/TicketController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";
import { UserRole } from "../entities/User.js";

const router = Router();

/**
 * las rutas de tickets requieren autenticación.
 */
router.use(authenticate);

/**
 * Consultas y creación general.
 */
router.get("/", ticketController.getTickets);
router.post("/", ticketController.createTicket);
router.get("/:id", ticketController.getTicket);

/**
 * Acciones sobre el ticket.
 */
router.patch("/:id/status", ticketController.changeStatus);
router.patch("/:id/priority", authorize([UserRole.ADMIN, UserRole.AGENT]), ticketController.updatePriority);
router.post("/:id/comments", ticketController.addComment);
router.patch("/:id/assign", authorize([UserRole.ADMIN]), ticketController.assignTicket);

export default router;
