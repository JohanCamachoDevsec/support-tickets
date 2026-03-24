import type {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export interface AuthRequest extends Request {
    user?: {userId: number, email: string, role: string}
}

/**
 * Middleware para autenticar el token JWT.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if(!authHeader|| !authHeader.startsWith("Bearer ")){
        throw new UnauthorizedError("Token no proporcionado o inválido");
    }
    const token = authHeader.split(' ')[1];

    try{
        req.user = jwt.verify(token, JWT_SECRET) as { userId: number, email: string, role: string };
        next();
    }catch{
        throw new UnauthorizedError("Token inválido");
    }
};

/**
 * Middleware para autorizar según el rol del usuario.
 * @param roles Roles permitidos para acceder al recurso
 */
export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new UnauthorizedError("No autenticado");
        }

        if (!roles.includes(req.user.role)) {
            throw new ForbiddenError("No tienes permisos para realizar esta acción");
        }

        next();
    };
};
