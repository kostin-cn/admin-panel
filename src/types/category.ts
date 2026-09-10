export interface Category {
  id: string;
  title: string;
  slug: string;
  description: string;
  createdAt: string;
}

export type CreateCategoryInput = Omit<Category, 'id' | 'createdAt'>;
