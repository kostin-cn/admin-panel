import api from './client';
import type {User, CreateUserInput} from '@/types';

export const usersApi = {
  getAll: () => api.get<User[]>('/users').then(res => res.data),

  getById: (id: string) => api.get<User>(`/users/${id}`).then(res => res.data),

  create: (data: CreateUserInput) => api.post<User>('/users', data).then(res => res.data),

  update: (id: string, data: Partial<User>) => api.put<User>(`/users/${id}`, data).then(res => res.data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/users/${id}`).then(res => res.data)
};
