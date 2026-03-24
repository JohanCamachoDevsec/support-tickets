import type { Request, Response } from 'express';
import * as authService from '../services/AuthService.js';
import * as userService from '../services/UserService.js';
import { createUserSchema } from '../validations/UserValidation.js';

/**
 * Controlador para la gestión de usuarios por parte del administrador.
 */
export const createUser = async (req: Request, res: Response) => {
    // Validación con Zod
    const validatedData = createUserSchema.parse(req.body);

    // Llamamos al servicio de autenticación con el rol deseado
    const result = await authService.register(validatedData);

    // En creación quizás no necesitemos el token del usuario,
    // pero mantenemos consistencia con el servicio.
    res.status(201).json({
        message: "Usuario creado correctamente por el administrador",
        user: result.user
    });
};

/**
 * Obtiene la lista de todos los usuarios registrados (solo ADMIN).
 */
export const getUsers = async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(users);
};

/**
 * Obtiene la lista de agentes y administradores disponibles.
 */
export const getAgents = async (req: Request, res: Response) => {
    const agents = await userService.getAgents();
    res.json(agents);
};
