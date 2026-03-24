import { Router } from "express";
import { ticketHistoryController } from "../controllers/TicketHistoryController.js";
import { authenticate, authorize } from "../middlewares/AuthMiddleware.js";
import { UserRole } from "../entities/User.js";

const router = Router();

/**
 * Las rutas de auditoría requieren autenticación y rol de ADMIN.
 */
router.use(authenticate);
router.use(authorize([UserRole.ADMIN]));

/**
 * Consulta de auditoría global.
 */
router.get("/", ticketHistoryController.getGlobalAudit);

export default router;
