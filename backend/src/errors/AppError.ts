/**
 * Clase base para errores personalizados de la aplicación.
 */
export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;
    public readonly details?: any;
    public readonly timestamp: string;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR', details?: any) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.details = details;
        this.timestamp = new Date().toISOString();

        Object.setPrototypeOf(this, new.target.prototype); // Restaurar cadena de prototipos
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error lanzado cuando no se han proporcionado credenciales válidas.
 */
export class UnauthorizedError extends AppError {
    constructor(message: string = 'No autorizado para realizar esta acción.') {
        super(message, 401, 'UNAUTHORIZED');
    }
}

/**
 * Error lanzado cuando el usuario no tiene permisos suficientes para el recurso solicitado.
 */
export class ForbiddenError extends AppError {
    constructor(message: string = 'Acceso denegado.') {
        super(message, 403, 'FORBIDDEN');
    }
}

/**
 * Error lanzado cuando no se encuentra un recurso.
 */
export class NotFoundError extends AppError {
    constructor(resourceName: string = 'Recurso') {
        super(`${resourceName} no encontrado.`, 404, 'NOT_FOUND');
    }
}

/**
 * Error lanzado por fallos de validación de entrada de datos.
 */
export class ValidationError extends AppError {
    constructor(message: string = 'Error de validación de campos.', fields: string[] = []) {
        super(message, 400, 'VALIDATION_ERROR', { fields });
    }
}

/**
 * Error lanzado por violaciones de reglas de negocio específicas.
 */
export class BusinessRuleError extends AppError {
    constructor(message: string, code: string = 'BUSINESS_RULE_VIOLATION') {
        super(message, 422, code);
    }
}

/**
 * Error genérico para fallos inesperados en la capa de persistencia/base de datos.
 * Oculta detalles sensibles del error original.
 */
export class DatabaseError extends AppError {
    public readonly originalError?: any;

    constructor(originalError?: any) {
        super('Ocurrió un error inesperado en la base de datos.', 500, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}
