<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Drawer from 'primevue/drawer'; // У PrimeVue v3 використовуйте 'primevue/sidebar'

defineProps<{
  collapsed: boolean;
}>();

const route = useRoute();
const authStore = useAuthStore();

const menuItems = computed(() => {
  const items = [
    { label: 'Статті', icon: 'pi pi-file-edit', to: '/articles' },
  ];

  if (authStore.isAdmin) {
    items.unshift({ label: 'Категорії', icon: 'pi pi-tags', to: '/categories' });
    items.unshift({ label: 'Користувачі', icon: 'pi pi-users', to: '/users' });
  }

  return items;
});
</script>

<template>
  <Drawer
    :visible="true"
    :modal="false"
    :dismissable="false"
    :show-close-icon="false"
    :transitionOptions="'0ms'"
    style="transform: none !important;"
    class="h-screen border-none shadow-1 transition-all transition-duration-300 select-none p-0 flex-shrink-0"
    :class="collapsed ? 'w-4rem' : 'w-16rem'"
    :pt="{
      root: { class: 'surface-card border-none' },
      content: { class: 'p-0 h-full flex flex-column justify-content-between overflow-hidden' },
      header: { class: 'hidden' }
    }"
  >
    <!-- Logo Header -->
    <div class="flex align-items-center h-4rem px-3 overflow-hidden flex-shrink-0">
      <div class="flex align-items-center justify-content-center w-2rem h-2rem border-round bg-primary text-primary-contrast font-bold text-xl flex-shrink-0 shadow-2 line-height-1">
        A
      </div>

      <div
        class="flex flex-column transition-all transition-duration-200 overflow-hidden"
        :class="collapsed ? 'opacity-0 ml-0 w-0 pointer-events-none' : 'opacity-100 ml-3 w-auto'"
      >
        <span class="font-bold text-lg text-color leading-tight w-max">Admin CMS</span>
        <span class="text-xs text-color-secondary font-medium w-max">Control Panel v1.0</span>
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="flex-1 overflow-y-auto py-3 px-2">
      <nav class="flex flex-column gap-1">
        <router-link
          v-for="item in menuItems"
          :key="item.to"
          :to="item.to"
          v-tooltip.right="collapsed ? item.label : undefined"
          class="flex align-items-center p-3 text-color no-underline border-round-lg font-medium transition-colors transition-duration-150 overflow-hidden"
          :class="[
            route.path === item.to
              ? 'bg-primary text-primary-contrast shadow-2 font-semibold'
              : 'text-color-secondary hover:text-color hover:surface-hover'
          ]"
        >
          <i :class="[item.icon, 'text-xl min-w-max']"></i>

          <span
            class="flex-1 transition-all transition-duration-200 overflow-hidden"
            :class="collapsed ? 'opacity-0 ml-0 w-0 pointer-events-none' : 'opacity-100 ml-3 w-auto'"
          >
            {{ item.label }}
          </span>
        </router-link>
      </nav>
    </div>

    <!-- Footer Status -->
    <div class="p-3 flex align-items-center overflow-hidden surface-50 dark:surface-900 flex-shrink-0">
      <span
        class="w-1rem h-1rem border-circle flex-shrink-0 shadow-1"
        style="background-color: var(--p-green-500, #22c55e);"
      ></span>

      <div
        class="flex flex-column transition-all transition-duration-200 overflow-hidden"
        :class="collapsed ? 'opacity-0 ml-0 w-0 pointer-events-none' : 'opacity-100 ml-2 w-auto'"
      >
        <span class="text-xs font-semibold text-color w-max">Сервер активний</span>
        <span class="text-xs text-color-secondary w-max">Оновлено щойно</span>
      </div>
    </div>
  </Drawer>
</template>
