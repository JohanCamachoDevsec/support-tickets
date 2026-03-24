import api from '@/lib/api';
import type { LoginType, RegisterType } from '@/types/Auth';
import type { AuthResponse, User } from '@/types/User';

/**
 * Servicio de autenticación para interactuar con la API del backend.
 */
const authService = {
  /**
   * Inicia sesión con las credenciales proporcionadas.
   */
  async login(credentials: LoginType): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  /**
   * Registra un nuevo usuario en el sistema.
   */
  async register(userData: RegisterType): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', userData);
    return data;
  },

  /**
   * Obtiene la información del usuario autenticado actualmente.
   */
  async getMe(): Promise<User> {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },
};

export default authService;
