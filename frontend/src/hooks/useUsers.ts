import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import type { CreateUserDTO } from '@/types/User';

export const useUsers = () => {
  const queryClient = useQueryClient();

  const useGetUsers = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['users'],
      queryFn: userService.getUsers,
      ...options,
    });
  };

  const useGetAgents = (options?: { enabled?: boolean }) => {
    return useQuery({
      queryKey: ['agents'],
      queryFn: userService.getAgents,
      ...options,
    });
  };

  const useCreateUser = () => {
    return useMutation({
      mutationFn: (data: CreateUserDTO) => userService.createUser(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['agents'] });
      },
    });
  };

  return {
    useGetUsers,
    useGetAgents,
    useCreateUser,
  };
};
