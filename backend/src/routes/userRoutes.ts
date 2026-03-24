import { Router } from 'express';
import * as userController from '../controllers/UserController.js';
import { authenticate, authorize } from '../middlewares/AuthMiddleware.js';
import { UserRole } from '../entities/User.js';

const router = Router();

/**
 * Gestión administrativa de usuarios.
 * Protegida: solo accesible para administradores autenticados.
 */
router.get('/',
    authenticate,
    authorize([UserRole.ADMIN]),
    userController.getUsers
);

router.post('/',
    authenticate,
    authorize([UserRole.ADMIN]),
    userController.createUser
);

/**
 * Obtención de agentes para asignación de tickets.
 * Accesible para ADMIN y AGENT.
 */
router.get('/agents',
    authenticate,
    authorize([UserRole.ADMIN, UserRole.AGENT]),
    userController.getAgents
);

export default router;
