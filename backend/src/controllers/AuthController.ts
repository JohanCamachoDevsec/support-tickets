import type { Request, Response } from 'express';
import * as authService from '../services/AuthService.js';
import { loginSchema, registerSchema } from '../validations/AuthValidation.js';
import type {AuthRequest} from '../middlewares/AuthMiddleware.js';
import {UserRole} from "../entities/User.js";

/**
 * Controlador para el registro de usuarios.
 * Válida los datos de entrada antes de proceder al registro.
 */
export const register = async (req: Request, res: Response) => {
    try {
        // Validación con Zod
        const validatedData = registerSchema.parse(req.body);
        const result = await authService.register({validatedData, role: UserRole.CLIENT});
        res.status(201).json(result);
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Controlador para el inicio de sesión.
 * Verifica las credenciales y devuelve un token JWT.
 */
export const login = async (req: Request, res: Response) => {
    try {
        // Validación con Zod
        const validatedData = loginSchema.parse(req.body);
        const result = await authService.login(validatedData.email, validatedData.password);
        res.json(result);
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(401).json({ error: error.message });
    }
};

/**
 * Obtiene el perfil del usuario autenticado actual.
 */
export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        const user = await authService.getUserById(req.user.userId);
        res.json(user);
    } catch (error: any) {
        res.status(404).json({ error: error.message });
    }
};
