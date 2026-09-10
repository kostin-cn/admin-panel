import type { AxiosAdapter, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { type User, type Category, type Article } from '@/types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface MockData {
  users: Record<string, User>;
  categories: Record<string, Category>;
  articles: Record<string, Article>;
}

const STORAGE_KEY = 'mockData';

const loadData = (): MockData => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { users: {}, categories: {}, articles: {} };
};

const saveData = (data: MockData): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

let mockData: MockData = loadData();

const mockAdapter: AxiosAdapter = async <T>(config: InternalAxiosRequestConfig): Promise<AxiosResponse<T>> => {
  const { method, url, data } = config;
  const randomDelay = Math.floor(Math.random() * 200) + 150;

  await delay(randomDelay);

  const [pathname, queryString] = (url || '').split('?');
  const urlParts = pathname?.split('/').filter(Boolean) || [];
  const queryParams = new URLSearchParams(queryString);
  const resource = urlParts[0];
  const id = urlParts[1] || null;

  if (!resource) {
    throw new Error('Invalid URL');
  }

  switch (method?.toLowerCase()) {
    case 'get':
      if (id) {
        const item = mockData[resource as keyof MockData][id];
        return {
          data: (item || null) as T,
          status: item ? 200 : 404,
          statusText: item ? 'OK' : 'Not Found',
          headers: {},
          config,
        };
      } else {
        const categorySlug = queryParams.get('category') || null
        const categoryId = categorySlug ? Object.keys(mockData.categories).find(
          (catId) => mockData.categories[catId]?.slug === categorySlug
        ) || null : null

        const items = (categorySlug ? Object.values(mockData[resource as keyof MockData] || {}).filter((elem: Article) => elem.categoryId === categoryId) :
          Object.values(mockData[resource as keyof MockData] || {})) as T;

        return {
          data: items,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
        };
      }

    case 'post':
      const newId = Date.now();
      const jsonData = JSON.parse(data);
      const resKey = resource as keyof MockData;

      const newItem = {
        ...jsonData,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      mockData[resKey][newId] = newItem;
      saveData(mockData);
      return {
        data: mockData[resKey][newId] as T,
        status: 201,
        statusText: 'Created',
        headers: {},
        config,
      };

    case 'put':
      if (!id) {
        throw new Error('ID is required for PUT requests');
      }
      mockData[resource as keyof MockData][id] = { ...mockData[resource as keyof MockData][id], ...JSON.parse(data) };
      saveData(mockData);
      return {
        data: mockData[resource as keyof MockData][id] as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };

    case 'delete':
      if (!id) {
        throw new Error('ID is required for DELETE requests');
      }

      const resourceKey = resource as keyof MockData;

      // Якщо видаляємо категорію — каскадно видаляємо всі пов'язані статті
      if (resourceKey === 'categories' && mockData.articles) {
        Object.entries(mockData.articles).forEach(([articleId, article]) => {
          if (article.categoryId === id) delete mockData.articles[articleId];
        });
      }

      delete mockData[resource as keyof MockData][id];
      saveData(mockData);
      return {
        data: { success: true } as T,
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      };

    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

export default mockAdapter;

export const reloadMockData = (): void => {
  mockData = loadData();
};
