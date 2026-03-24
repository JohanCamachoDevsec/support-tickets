import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../config/database.js';
import { User, UserRole } from '../entities/User.js';
import { BusinessRuleError, UnauthorizedError, NotFoundError } from '../errors/AppError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

/**
 * Registra un nuevo usuario en el sistema.
 * @param body Datos del usuario (email, name, password)
 * @returns El usuario creado y un token JWT
 */
export async function register(body: any) {
  const userRepository = AppDataSource.getRepository(User);
  const { email, password, name, role } = body;

  const existingUser = await userRepository.findOneBy({ email });
  if (existingUser) {
    throw new BusinessRuleError('El email ya está registrado', 'EMAIL_ALREADY_EXISTS');
  }

  // Hasheo de contraseña
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = userRepository.create({
    email,
    name,
    password: hashedPassword,
    role: role || UserRole.CLIENT
  });

  await userRepository.save(user);

  // Generar token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '12h' }
  );

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
}

/**
 * Auténtica un usuario y genera un token JWT.
 * @param email Correo electrónico del usuario
 * @param password Contraseña sin encriptar
 * @returns Los datos del usuario y un token JWT
 */
export async function login(email: string, password: string) {
  const userRepository = AppDataSource.getRepository(User);
  // Buscamos al usuario incluyendo el campo password (que tiene select: false)
  const user = await userRepository.createQueryBuilder('user')
    .addSelect('user.password')
    .where('user.email = :email', { email })
    .getOne();

  if (!user) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Credenciales inválidas');
  }

  // Generar token JWT con payload enriquecido para roles
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  };
}

/**
 * Recupera un usuario por su ID sin exponer la contraseña.
 * @param userId ID del usuario a buscar
 * @returns Datos del usuario
 */
export async function getUserById(userId: number) {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOneBy({ id: userId });
  if (!user) {
    throw new NotFoundError('Usuario');
  }
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

