import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import {type AuthCredentials, type User, Role} from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(JSON.parse(localStorage.getItem('admin_user') || 'null'));

  const token = ref<string | null>(localStorage.getItem('admin_token') || null);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value && !!user.value);
  const isAdmin = computed(() => user.value?.role === 'admin');

  async function login(credentials: AuthCredentials): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      // Симуляція затримки мережі
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Проста перевірка тестових акаунтів
      if (credentials.email === 'admin@demo.com' && credentials.password === 'password123') {
        user.value = { id: '1', name: 'Адмін', email: credentials.email, role: Role.ADMIN, allowedCategoryIds: [], createdAt: Date.now().toString() };
      } else if (credentials.email === 'manager@demo.com' && credentials.password === 'password123') {
        user.value = { id: '2', name: 'Менеджер', email: credentials.email, role: Role.MANAGER, allowedCategoryIds: [], createdAt: Date.now().toString() };
      } else {
        throw new Error('Невірний email або пароль');
      }

      const dummyToken = 'mock-jwt-token-' + Date.now();

      token.value = dummyToken;

      localStorage.setItem('admin_token', dummyToken);
      localStorage.setItem('admin_user', JSON.stringify(user.value));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Помилка авторизації';
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  function logout(): void {
    token.value = null;
    user.value = null;
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  return {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    logout,
  };
});
