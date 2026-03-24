import type { Request, Response } from 'express';
import * as authService from '../services/AuthService.js';
import * as userService from '../services/UserService.js';
import { createUserSchema } from '../validations/UserValidation.js';

/**
 * Controlador para la gestión de usuarios por parte del administrador.
 */
export const createUser = async (req: Request, res: Response) => {
    try {
        // Validación con Zod
        const validatedData = createUserSchema.parse(req.body);

        // Llamamos al servicio de autenticación con el rol deseado
        const result = await authService.register(validatedData);

        // En creación quizás no necesitemos el token del usuario
        // pero mantenemos consistencia con el servicio.
        res.status(201).json({
            message: "Usuario creado correctamente por el administrador",
            user: result.user
        });
    } catch (error: any) {
        if (error.errors) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        res.status(400).json({ error: error.message });
    }
};

/**
 * Obtiene la lista de todos los usuarios registrados (solo ADMIN).
 */
export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Obtiene la lista de agentes y administradores disponibles.
 */
export const getAgents = async (req: Request, res: Response) => {
    try {
        const agents = await userService.getAgents();
        res.json(agents);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
