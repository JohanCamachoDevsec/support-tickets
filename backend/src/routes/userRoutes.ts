import { Router } from 'express';
import * as userController from '../controllers/UserController.js';
import { authenticate, authorize } from '../middlewares/AuthMiddleware.js';
import { UserRole } from '../entities/User.js';

const router = Router();

/**
 * Gestión administrativa de usuarios.
 * Protegida: solo accesible para administradores autenticados.
 */
router.post('/',
    authenticate,
    authorize([UserRole.ADMIN]),
    userController.createUser
);

export default router;
