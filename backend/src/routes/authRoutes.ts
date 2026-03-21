import { Router } from 'express';
import * as authController from '../controllers/AuthController.js';
import { authenticate, authorize } from '../middlewares/AuthMiddleware.js';
import { UserRole } from '../entities/User.js';

const router = Router();

/**
 * Rutas de autenticación pública
 */
router.post('/register', authController.register);
router.post('/login', authController.login);

/**
 * Rutas protegida de autenticación
 */
router.get('/me', authenticate, authController.getMe);

/**
 * ruta protegidas por rol
 */

export default router;
