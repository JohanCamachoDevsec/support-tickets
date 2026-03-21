import type {NextFunction, Request, Response} from 'express';
import jwt from 'jsonwebtoken';

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
        return res.status(401).json({error: "Token no proporcionado o inválido"});
    }
    const token = authHeader.split(' ')[1];

    try{
        req.user = jwt.verify(token, JWT_SECRET) as { userId: number, email: string, role: string };
        next();
    }catch{
        return res.status(401).json({error: "Token inválido"});
    }
};

/**
 * Middleware para autorizar según el rol del usuario.
 * @param roles Roles permitidos para acceder al recurso
 */
export const authorize = (roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ error: "No autenticado" });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "No tienes permisos para realizar esta acción" });
        }

        next();
    };
};
