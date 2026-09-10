import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useAuthStore } from '@/stores/auth';
import type { AuthCredentials } from '@/types';

export function useAuthActions() {
  const router = useRouter();
  const route = useRoute();
  const authStore = useAuthStore();
  const toast = useToast();

  const isSubmitting = ref<boolean>(false);

  const login = async (credentials: AuthCredentials) => {
    isSubmitting.value = true;

    try {
      await authStore.login(credentials);

      const redirectPath = (route.query.redirect as string) || '/';
      await router.push(redirectPath);
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Помилка',
        detail: 'Невірний email або пароль',
        life: 3000,
      })
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    isSubmitting,
    login,
  };
}
