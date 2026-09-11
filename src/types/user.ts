export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  allowedCategoryIds: number[]; // Порожній масив для admin, список ID категорій для manager
  createdAt: string;
}

export type CreateUserInput = Omit<User, 'id' | 'createdAt'>;

export interface AuthCredentials {
  email: string;
  password: string;
}
