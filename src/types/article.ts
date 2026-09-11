export interface Article {
  id: number;
  categoryId: number;
  title: string;
  slug: string;
  imageUrl: string;
  shortDescription: string;
  content: string; // HTML-розмітка
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateArticleInput = Omit<Article, 'id' | 'createdAt' | 'updatedAt'>;
