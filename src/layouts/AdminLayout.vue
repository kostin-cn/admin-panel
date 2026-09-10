<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import AppHeader from '@/components/common/AppHeader.vue';
import AppSidebar from '@/components/common/AppSidebar.vue';
import AppFooter from '@/components/common/AppFooter.vue';

const isSidebarCollapsed = ref(false);
</script>

<template>
  <div class="min-h-screen flex surface-ground">
    <AppSidebar :collapsed="isSidebarCollapsed" />

    <div
      class="flex flex-column flex-1 min-w-0 transition-all transition-duration-300"
      :style="{ marginLeft: isSidebarCollapsed ? '4rem' : '16rem' }"
    >
      <AppHeader @toggle-sidebar="isSidebarCollapsed = !isSidebarCollapsed" />

      <main class="flex-1 p-4 md:p-5 overflow-y-auto">
        <RouterView />
      </main>

      <AppFooter />
    </div>
  </div>
</template>
