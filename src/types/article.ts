export interface Article {
  id: string;
  categoryId: string;
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
