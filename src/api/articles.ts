import api from './client';
import type {Article, CreateArticleInput} from '@/types';

export const articlesApi = {
  getAll: () => api.get<Article[]>('/articles').then(res => res.data),

  getByCategorySlug: (categorySlug: string) =>
    api.get<Article[]>(`/articles?category=${categorySlug}`).then(res => res.data),

  getById: (id: string) => api.get<Article>(`/articles/${id}`).then(res => res.data),

  create: (data: CreateArticleInput) => api.post<Article>('/articles', data).then(res => res.data),

  update: (id: string, data: Partial<Article>) => api.put<Article>(`/articles/${id}`, data).then(res => res.data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/articles/${id}`).then(res => res.data)
};
