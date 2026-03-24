import { AppDataSource } from '../config/database.js';
import { User, UserRole } from '../entities/User.js';

/**
 * Servicio para la gestión de usuarios.
 */
export const getAgents = async (): Promise<User[]> => {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.find({
        where: { role: UserRole.AGENT },
        select: ['id', 'name', 'email', 'role', 'createdAt']
    });
};

/**
 * Obtiene todos los usuarios del sistema.
 */
export const getAllUsers = async (): Promise<User[]> => {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.find({
        select: ['id', 'name', 'email', 'role', 'createdAt'],
        order: { createdAt: 'DESC' }
    });
};
