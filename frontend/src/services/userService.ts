import api from '@/lib/api';
import type { User, CreateUserDTO } from '@/types/User';

export const userService = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users');
    return response.data;
  },

  getAgents: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/agents');
    return response.data;
  },

  createUser: async (data: CreateUserDTO): Promise<User> => {
    const response = await api.post<User>('/users', data);
    return response.data;
  },
};
