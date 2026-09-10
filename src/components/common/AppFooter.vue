<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<template>
  <footer class="p-3 surface-card mt-auto flex flex-column sm:flex-row align-items-center justify-content-between text-sm text-color-secondary gap-2 shadow-1">
    <span>&copy; {{ currentYear }} <strong class="text-color">Admin CMS Panel</strong></span>
    <span class="text-xs">v1.0.0</span>
  </footer>
</template>
