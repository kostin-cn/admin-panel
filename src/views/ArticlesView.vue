<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select';
import Tag from 'primevue/tag';

import { useArticleStore } from '@/stores/articles';
import { useCategoryStore } from '@/stores/categories';
import { useUserStore } from '@/stores/users';
import { useArticleActions } from '@/composables/useArticleActions';

const router = useRouter();
const articleStore = useArticleStore();
const categoryStore = useCategoryStore();
const userStore = useUserStore();

const { deleteArticle } = useArticleActions();

onMounted(() => {
  articleStore.fetchAllArticles();

  if (categoryStore.categories.length === 0) {
    categoryStore.fetchCategories();
  }

  if (userStore.users.length === 0) {
    userStore.fetchUsers();
  }
});

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Map для миттєвого пошуку O(1) назви категорії та автора за ID
const categoryMap = computed(() => {
  return new Map(categoryStore.categories.map((c) => [String(c.id), c.title]));
});

const userMap = computed(() => {
  // Статичні тестові автори, яких немає в сторі
  const map = new Map<string, string>([
    ['1', 'Адмін'],
    ['2', 'Менеджер'],
  ]);

  userStore.users.forEach((u) => {
    map.set(String(u.id), u.name);
  });

  return map;
});

// Пошук та фільтри
const searchQuery = ref('');
const selectedCategoryId = ref<string | null>(null);
const selectedAuthorId = ref<string | null>(null);

const filteredArticles = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  return articleStore.articles.filter((article) => {
    const matchesSearch =
      !q ||
      article.title.toLowerCase().includes(q) ||
      article.slug.toLowerCase().includes(q) ||
      (article.shortDescription && article.shortDescription.toLowerCase().includes(q));

    const matchesCategory =
      !selectedCategoryId.value || String(article.categoryId) === String(selectedCategoryId.value);

    const matchesAuthor =
      !selectedAuthorId.value || String(article.authorId) === String(selectedAuthorId.value);

    return matchesSearch && matchesCategory && matchesAuthor;
  });
});

const goToCreate = () => {
  router.push('/articles/create');
};

const goToEdit = (id: string) => {
  router.push(`/articles/${id}`);
};
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Заголовок та кнопка створення -->
    <div class="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-color m-0">Статті</h1>
        <p class="text-color-secondary text-sm m-0 mt-1">Управління публікаціями та контентом сайту</p>
      </div>
      <Button
        label="Нова стаття"
        icon="pi pi-plus"
        class="p-button-primary shadow-1"
        @click="goToCreate"
      />
    </div>

    <!-- Таблиця даних -->
    <div class="surface-card p-4 border-round-xl shadow-1 border-1 surface-border">
      <!-- Верхній бар: пошук та фільтри -->
      <div class="flex flex-column lg:flex-row gap-3 justify-content-between align-items-stretch lg:align-items-center mb-4">
        <div class="flex flex-column sm:flex-row gap-3 w-full lg:w-auto">
          <!-- Пошуковий інпут -->
          <IconField iconPosition="left" class="w-full sm:w-20rem">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Пошук за назвою, slug чи описом..."
              class="w-full"
            />
          </IconField>

          <!-- Фільтр за категорією -->
          <Select
            v-model="selectedCategoryId"
            :options="categoryStore.categories"
            optionLabel="title"
            optionValue="id"
            placeholder="Усі категорії"
            showClear
            class="w-full sm:w-14rem"
          />

          <!-- Фільтр за автором -->
          <Select
            v-model="selectedAuthorId"
            :options="userStore.users"
            optionLabel="name"
            optionValue="id"
            placeholder="Усі автори"
            showClear
            class="w-full sm:w-14rem"
          />
        </div>
      </div>

      <DataTable
        :value="filteredArticles"
        :loading="articleStore.isLoading"
        paginator
        :rows="25"
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <!-- Слот для порожнього стану -->
        <template #empty>
          <div class="flex flex-column align-items-center justify-content-center p-4 text-color-secondary" style="min-height: 5rem">
            <span class="font-medium">{{ articleStore.isLoading ? '' : 'Статей не знайдено' }}</span>
          </div>
        </template>

        <!-- Слот завантаження -->
        <template #loading>
          <div class="flex align-items-center justify-content-center pb-4">
            <i class="pi pi-spin pi-spinner text-2xl mr-2"></i>
            <span>Завантаження статей...</span>
          </div>
        </template>

        <!-- Зображення та назва -->
        <Column field="title" header="Стаття" sortable>
          <template #body="{ data }">
            <div class="flex align-items-center gap-3">
              <div
                v-if="data.imageUrl"
                class="w-3rem h-3rem border-round overflow-hidden surface-ground flex-shrink-0 flex justify-content-center align-items-center border-1 surface-border"
              >
                <img :src="data.imageUrl" :alt="data.title" class="w-full h-full object-cover" />
              </div>
              <div
                v-else
                class="w-3rem h-3rem border-round surface-ground flex-shrink-0 flex align-items-center justify-content-center text-color-secondary border-1 surface-border"
              >
                <i class="pi pi-image text-xl"></i>
              </div>
              <div class="flex flex-column">
                <span class="font-semibold text-color line-height-2">{{ data.title }}</span>
                <span class="text-xs text-color-secondary font-mono">/{{ data.slug }}</span>
              </div>
            </div>
          </template>
        </Column>

        <!-- Категорія -->
        <Column header="Категорія">
          <template #body="{ data }">
            <Tag
              v-if="categoryMap.get(String(data.categoryId))"
              :value="categoryMap.get(String(data.categoryId))"
              severity="secondary"
              class="text-xs"
            />
            <span v-else class="text-xs text-color-secondary italic">Без категорії</span>
          </template>
        </Column>

        <!-- Автор -->
        <Column header="Автор">
          <template #body="{ data }">
            <span class="text-sm text-color">
              {{ userMap.get(String(data.authorId)) ?? '—' }}
            </span>
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
                @click="goToEdit(data.id)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Видалити"
                @click="deleteArticle(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>
