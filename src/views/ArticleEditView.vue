<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Editor from 'primevue/editor';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

import { useArticleStore } from '@/stores/articles';
import { useCategoryStore } from '@/stores/categories';

const route = useRoute();
const router = useRouter();
const articleStore = useArticleStore();
const categoryStore = useCategoryStore();

// Визначаємо режим: якщо є id у маршруті, то це редагування
const articleId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!articleId.value && articleId.value !== 'create');

// Стан для модалки підтвердження видалення
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);

// Zod-схема
const articleSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Заголовок обов\'язковий')
      .max(200, 'Заголовок занадто довгий'),
    categoryId: z.union([
      z.string().min(1, 'Оберіть категорію'),
      z.number({ invalid_type_error: 'Оберіть категорію' }).min(1, 'Оберіть категорію')
    ], {
      errorMap: () => ({ message: 'Оберіть категорію' })
    }),
    shortDescription: z.string().trim().max(500, 'Максимум 500 символів').default(''),
    content: z.string().min(1, 'Контент статті не може бути порожнім'),
    imageUrl: z.string().trim().default(''),
  })
);

const { handleSubmit, errors, resetForm, defineField } = useForm({
  validationSchema: articleSchema,
  initialValues: {
    title: '',
    categoryId: '',
    shortDescription: '',
    content: '',
    imageUrl: '',
  },
});

const fieldOpts = { validateOnBlur: true };

const [title] = defineField('title', fieldOpts);
const [categoryId] = defineField('categoryId');
const [shortDescription] = defineField('shortDescription', fieldOpts);
const [content] = defineField('content', fieldOpts);
const [imageUrl] = defineField('imageUrl', fieldOpts);

// Генерація slug перед збереженням
function generateSlug(text: string): string {
  const cyrillicMap: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ye', ж: 'zh',
    з: 'z', и: 'y', і: 'i', ї: 'yi', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n',
    о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
    ч: 'ch', ш: 'sh', щ: 'shch', ь: '', ю: 'yu', я: 'ya',
  };

  return text
    .toLowerCase()
    .split('')
    .map((char) => cyrillicMap[char] ?? char)
    .join('')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Завантаження даних при монтуванні
onMounted(async () => {
  if (categoryStore.categories.length === 0) {
    await categoryStore.fetchCategories();
  }

  if (isEditing.value && articleId.value) {
    await articleStore.fetchArticleById(Number(articleId.value));
    const article = articleStore.currentArticle;
    if (article) {
      resetForm({
        values: {
          title: article.title || '',
          categoryId: article.categoryId || '',
          shortDescription: article.shortDescription || '',
          content: article.content || '',
          imageUrl: article.imageUrl || '',
        },
      });
    } else {
      router.push('/articles');
    }
  }
});

// Збереження / Створення
const onSubmit = handleSubmit(async (values) => {
  const payload = {
    ...values,
    categoryId: Number(values.categoryId),
    slug: generateSlug(values.title),
    authorId: '1', // Можна підтягувати з authStore
  };

  if (isEditing.value && articleId.value) {
    await articleStore.updateArticle(Number(articleId.value), payload);
  } else {
    await articleStore.createArticle(payload);
  }

  router.push('/articles');
});

// Видалення статті
const handleDelete = async () => {
  if (!articleId.value) return;

  isDeleting.value = true;
  try {
    await articleStore.deleteArticle(Number(articleId.value));
    isDeleteModalOpen.value = false;
    router.push('/articles');
  } finally {
    isDeleting.value = false;
  }
};

const pageTitle = computed(() =>
  isEditing.value ? 'Редагувати статтю' : 'Нова стаття'
);

const submitButtonLabel = computed(() => {
  if (articleStore.isLoading) {
    return isEditing.value ? 'Збереження...' : 'Створення...';
  }
  return isEditing.value ? 'Зберегти' : 'Опублікувати';
});
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Шапка сторінки -->
    <div class="flex align-items-center justify-content-between gap-3">
      <div class="flex align-items-center gap-2">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          severity="secondary"
          aria-label="Назад"
          @click="router.push('/articles')"
        />
        <h1 class="text-2xl font-bold text-color m-0">{{ pageTitle }}</h1>
      </div>

      <!-- Кнопка видалення (тільки при редагуванні) -->
      <Button
        v-if="isEditing"
        label="Видалити"
        icon="pi pi-trash"
        severity="danger"
        outlined
        :disabled="articleStore.isLoading"
        @click="isDeleteModalOpen = true"
      />
    </div>

    <!-- Форма -->
    <form @submit.prevent="onSubmit" class="grid">
      <!-- Ліва колонка: Контент (8 з 12) -->
      <div class="col-12 lg:col-8 flex flex-column gap-3">
        <div class="surface-card p-4 border-round-xl border-1 surface-border shadow-1 flex flex-column gap-3">
          <!-- Заголовок -->
          <div class="flex flex-column gap-1">
            <label for="title" class="font-semibold text-sm">Заголовок статті</label>
            <InputText
              id="title"
              v-model="title"
              placeholder="Введіть заголовок..."
              class="text-lg font-semibold"
              :invalid="!!errors.title"
              :disabled="articleStore.isLoading"
            />
            <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
          </div>

          <!-- Короткий опис -->
          <div class="flex flex-column gap-1">
            <label for="shortDescription" class="font-semibold text-sm">Короткий опис (анонс)</label>
            <Textarea
              id="shortDescription"
              v-model="shortDescription"
              rows="3"
              autoResize
              placeholder="Короткий зміст для картки прев'ю..."
              :invalid="!!errors.shortDescription"
              :disabled="articleStore.isLoading"
            />
            <small v-if="errors.shortDescription" class="text-red-500">{{ errors.shortDescription }}</small>
          </div>

          <!-- Текст статті (HTML / WYSIWYG Editor) -->
          <div class="flex flex-column gap-1">
            <label for="content" class="font-semibold text-sm">Текст статті</label>
            <Editor
              id="content"
              v-model="content"
              editorStyle="height: 350px"
              placeholder="Основний вміст статті..."
              :class="{ 'p-invalid': errors.content }"
              :disabled="articleStore.isLoading"
            />
            <small v-if="errors.content" class="text-red-500">{{ errors.content }}</small>
          </div>
        </div>
      </div>

      <!-- Права колонка: Налаштування та збереження (4 з 12) -->
      <div class="col-12 lg:col-4 flex flex-column gap-3">
        <div class="surface-card p-4 border-round-xl border-1 surface-border shadow-1 flex flex-column gap-3">
          <h3 class="text-base font-semibold m-0">Параметри публікації</h3>

          <!-- Категорія -->
          <div class="flex flex-column gap-1">
            <label for="categoryId" class="font-semibold text-sm">Категорія</label>
            <Select
              id="categoryId"
              v-model="categoryId"
              :options="categoryStore.categories"
              optionLabel="title"
              optionValue="id"
              placeholder="Оберіть категорію"
              class="w-full"
              :invalid="!!errors.categoryId"
              :disabled="articleStore.isLoading"
            />
            <small v-if="errors.categoryId" class="text-red-500">{{ errors.categoryId }}</small>
          </div>

          <!-- URL обкладинки -->
          <div class="flex flex-column gap-1">
            <label for="imageUrl" class="font-semibold text-sm">URL зображення</label>
            <InputText
              id="imageUrl"
              v-model="imageUrl"
              placeholder="https://example.com/image.jpg"
              :disabled="articleStore.isLoading"
            />
          </div>

          <!-- Прев'ю обкладинки, якщо введено URL -->
          <div v-if="imageUrl" class="border-round overflow-hidden surface-ground flex justify-content-center align-items-center max-h-12rem">
            <img :src="imageUrl" alt="Preview" class="w-full h-full object-cover" />
          </div>

          <hr class="border-top-1 border-none surface-border my-2" />

          <!-- Дії -->
          <div class="flex gap-2">
            <Button
              type="button"
              label="Скасувати"
              severity="secondary"
              text
              class="w-full"
              :disabled="articleStore.isLoading"
              @click="router.push('/articles')"
            />
            <Button
              type="submit"
              :label="submitButtonLabel"
              icon="pi pi-check"
              class="w-full"
              :loading="articleStore.isLoading"
            />
          </div>
        </div>
      </div>
    </form>

    <!-- Диалог підтвердження видалення -->
    <Dialog
      v-model:visible="isDeleteModalOpen"
      header="Підтвердження видалення"
      modal
      :closable="!isDeleting"
      class="w-full max-w-28rem"
    >
      <div class="flex align-items-center gap-3 py-2">
        <i class="pi pi-exclamation-triangle text-red-500 text-3xl"></i>
        <span>Ви дійсно бажаєте видалити цю статтю? Цю дію неможливо скасувати.</span>
      </div>
      <template #footer>
        <Button
          label="Скасувати"
          text
          severity="secondary"
          :disabled="isDeleting"
          @click="isDeleteModalOpen = false"
        />
        <Button
          label="Видалити"
          severity="danger"
          icon="pi pi-trash"
          :loading="isDeleting"
          @click="handleDelete"
        />
      </template>
    </Dialog>
  </div>
</template>
