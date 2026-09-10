<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';

import { useCategoryStore } from '@/stores/categories';
import CategoryFormModal from '@/components/categories/CategoryFormModal.vue';
import { useCategoryActions } from '@/composables/useCategoryActions';

const categoryStore = useCategoryStore();
const {
  isCategoryModalOpen,
  openCategoryModal,
  deleteCategory,
} = useCategoryActions();

onMounted(() => {
  categoryStore.fetchCategories();
});

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Пошук та фільтрація категорій
const searchQuery = ref('');

const filteredCategories = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  if (!q) return categoryStore.categories;

  return categoryStore.categories.filter((cat) => {
    return (
      cat.title.toLowerCase().includes(q) ||
      cat.slug.toLowerCase().includes(q) ||
      (cat.description && cat.description.toLowerCase().includes(q))
    );
  });
});
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Заголовок та кнопка створення -->
    <div class="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-color m-0">Категорії</h1>
        <p class="text-color-secondary text-sm m-0 mt-1">Управління категоріями та розділами матеріалів</p>
      </div>
      <Button
        label="Нова категорія"
        icon="pi pi-plus"
        class="p-button-primary shadow-1"
        @click="openCategoryModal()"
      />
    </div>

    <!-- Таблиця даних -->
    <div class="surface-card p-4 border-round-xl shadow-1 border-1 surface-border">
      <!-- Верхній бар: пошук -->
      <div class="flex flex-column sm:flex-row gap-3 justify-content-between align-items-stretch sm:align-items-center mb-4">
        <div class="flex flex-column sm:flex-row gap-3 w-full sm:w-auto">
          <!-- Пошуковий інпут -->
          <IconField iconPosition="left" class="w-full sm:w-20rem">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Пошук за назвою, slug або описом..."
              class="w-full"
            />
          </IconField>
        </div>
      </div>

      <DataTable
        :value="filteredCategories"
        :loading="categoryStore.isLoading"
        paginator
        :rows="25"
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <!-- Слот для порожнього стану в PrimeVue v4 -->
        <template #empty>
          <div class="flex flex-column align-items-center justify-content-center p-4 text-color-secondary" style="min-height: 5rem">
            <span class="font-medium">{{ categoryStore.isLoading ? '' : 'Категорій не знайдено' }}</span>
          </div>
        </template>

        <!-- Слот для стану завантаження -->
        <template #loading>
          <div class="flex align-items-center justify-content-center pb-4">
            <i class="pi pi-spin pi-spinner text-2xl mr-2"></i>
            <span>Завантаження категорій...</span>
          </div>
        </template>

        <!-- Назва та Slug -->
        <Column field="title" header="Категорія" sortable>
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-semibold text-color">{{ data.title }}</span>
              <span class="text-xs text-color-secondary font-mono">/{{ data.slug }}</span>
            </div>
          </template>
        </Column>

        <!-- Опис -->
        <Column field="description" header="Опис">
          <template #body="{ data }">
            <span v-if="data.description" class="text-sm text-color">
              {{ data.description }}
            </span>
            <span v-else class="text-xs text-color-secondary italic">Без опису</span>
          </template>
        </Column>

        <!-- Дата створення -->
        <Column field="createdAt" header="Створено" sortable>
          <template #body="{ data }">
            <span class="text-sm text-color-secondary">{{ formatDate(data.createdAt) }}</span>
          </template>
        </Column>

        <!-- Дії -->
        <Column header="Дії" class="w-8rem text-right">
          <template #body="{ data }">
            <div class="flex justify-content-end gap-1">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                severity="secondary"
                aria-label="Редагувати"
                @click="openCategoryModal(data)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Видалити"
                @click="deleteCategory(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Модальне вікно створення / редагування -->
    <CategoryFormModal v-if="isCategoryModalOpen" />
  </div>
</template>
