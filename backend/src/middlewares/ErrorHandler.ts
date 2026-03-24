import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';

/**
 * Middleware centralizado para el manejo de errores en la aplicación.
 * Captura errores lanzados desde cualquier punto y responde con un formato consistente.
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Logueamos el stack tracé en consola para depuración
    console.error(`[ERROR] [${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.error(err);

    // Si ya se enviaron las cabeceras, dejamos que Express maneje el error
    if (res.headersSent) {
        return next(err);
    }

    // Manejo de errores de validación de Zod
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'Error de validación de campos.',
            details: {
                fields: err.issues.map(issue => ({
                    path: issue.path.join('.'),
                    message: issue.message
                }))
            },
            timestamp: new Date().toISOString()
        });
    }

    // Manejo de AppError (Errores controlados)
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            code: err.code,
            message: err.message,
            details: err.details || null,
            timestamp: err.timestamp
        });
    }

    // Manejo de errores desconocidos (Errores no controlados)
    // No exponemos detalles sensibles del error original al cliente.
    return res.status(500).json({
        success: false,
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Ha ocurrido un error inesperado en el servidor.',
        timestamp: new Date().toISOString()
    });
};
