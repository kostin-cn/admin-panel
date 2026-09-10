<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useTheme } from '@/composables/useTheme';
import Button from 'primevue/button';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void;
}>();

const authStore = useAuthStore();
const router = useRouter();
const { isDark, toggleTheme } = useTheme();
const userMenu = ref();

const avatarLabel = computed(() => {
  return authStore.user?.name ? authStore.user.name.charAt(0).toUpperCase() : 'U';
});

const toggleUserMenu = (event: Event) => {
  userMenu.value?.toggle(event);
};

const menuItems = computed(() => [
  {
    label: authStore.user?.email || 'Користувач',
    items: [
      {
        label: isDark.value ? 'Світла тема' : 'Темна тема',
        icon: isDark.value ? 'pi pi-sun text-yellow-500' : 'pi pi-moon text-blue-400',
        command: toggleTheme,
      },
      {
        separator: true,
      },
      {
        label: 'Вийти з системи',
        icon: 'pi pi-sign-out text-red-500',
        command: () => {
          authStore.logout();
          router.push('/login');
        },
      },
    ],
  },
]);
</script>

<template>
  <header class="flex align-items-center justify-content-between h-4rem px-4 surface-card sticky top-0 z-2 shadow-1">
    <div class="flex align-items-center gap-2">
      <Button
        icon="pi pi-bars"
        text
        rounded
        aria-label="Toggle Sidebar"
        class="text-color-secondary hover:text-color"
        @click="emit('toggle-sidebar')"
      />
    </div>

    <div class="flex align-items-center gap-3">
      <!-- Профіль користувача -->
      <div
        v-if="authStore.user"
        class="flex align-items-center cursor-pointer p-2 border-round-lg hover:surface-hover transition-colors transition-duration-150"
        @click="toggleUserMenu"
      >
        <Avatar
          :label="avatarLabel"
          shape="circle"
          class="mr-2 bg-primary text-primary-contrast font-bold shadow-2 line-height-1"
        />
        <div class="hidden sm:flex flex-column text-left mr-2">
          <span class="font-semibold text-sm text-color leading-tight">{{ authStore.user.name }}</span>
        </div>
        <i class="pi pi-chevron-down text-xs text-color-secondary ml-1"></i>
      </div>

      <Menu ref="userMenu" :model="menuItems" :popup="true" />
    </div>
  </header>
</template>
