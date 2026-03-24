import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/authService';
import type { LoginType, RegisterType } from '@/types/Auth';
import type { AuthResponse, User } from '@/types/User';

/**
 * Hook para gestionar la autenticación del usuario.
 */
export const useAuth = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Query para obtener el usuario actual
  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      if (!token) return null;
      try {
        return await authService.getMe();
      } catch (error) {
        localStorage.removeItem('token');
        return null;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Mutación para el inicio de sesión
  const loginMutation = useMutation<AuthResponse, Error, LoginType>({
    mutationFn: (credentials) => authService.login(credentials),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  // Mutación para el registro
  const registerMutation = useMutation<AuthResponse, Error, RegisterType>({
    mutationFn: (userData) => authService.register(userData),
    onSuccess: (data) => {
      localStorage.setItem('token', data.token);
      queryClient.setQueryData(['user'], data.user);
    },
  });

  /**
   * Cierra la sesión del usuario.
   */
  const logout = () => {
    localStorage.removeItem('token');
    queryClient.setQueryData(['user'], null);
    navigate('/login');
  };

  return {
    user,
    isLoading,
    isError,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
    isAuthenticated: !!user,
  };
};
