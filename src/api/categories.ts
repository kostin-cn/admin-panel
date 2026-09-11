import api from './client';
import type {Category, CreateCategoryInput} from '@/types';

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories').then(res => res.data),

  getById: (id: number) => api.get<Category>(`/categories/${id}`).then(res => res.data),

  create: (data: CreateCategoryInput) => api.post<Category>('/categories', data).then(res => res.data),

  update: (id: number, data: Partial<Category>) => api.put<Category>(`/categories/${id}`, data).then(res => res.data),

  delete: (id: number) => api.delete<{ success: boolean }>(`/categories/${id}`).then(res => res.data)
};
