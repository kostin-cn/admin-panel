<script setup lang="ts">
import { computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import { useCategoryActions } from '@/composables/useCategoryActions';

const {
  isCategoryModalOpen,
  editingCategory,
  closeCategoryModal,
  createCategory,
  updateCategory,
  isSubmitting,
} = useCategoryActions();

const isEditing = computed(() => !!editingCategory.value?.id);

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return isEditing.value ? 'Збереження...' : 'Створення...';
  }
  return isEditing.value ? 'Зберегти' : 'Створити';
});

// Zod-схема валідації (без slug)
const categorySchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .trim()
      .min(1, 'Назва категорії є обов\'язковою')
      .max(100, 'Назва не повинна перевищувати 100 символів'),
    description: z
      .string()
      .max(500, 'Опис не повинен перевищувати 500 символів')
      .optional(),
  })
);

// Ініціалізація форми
const { handleSubmit, errors, resetForm, defineField } = useForm({
  validationSchema: categorySchema,
  initialValues: {
    title: '',
    description: '',
  },
});

const fieldOpts = { validateOnBlur: true };

const [title] = defineField('title', fieldOpts);
const [description] = defineField('description', fieldOpts);

// Генерація slug з назви перед відправкою
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

function syncForm() {
  if (editingCategory.value) {
    resetForm({
      values: {
        title: editingCategory.value.title || '',
        description: editingCategory.value.description || '',
      },
    });
  } else {
    resetForm({
      values: {
        title: '',
        description: '',
      },
    });
  }
}

const onSubmit = handleSubmit(async (values) => {
  const payload = {
    title: values.title.trim(),
    slug: generateSlug(values.title),
    description: values.description ? values.description.trim() : '',
  };

  if (editingCategory.value?.id) {
    await updateCategory(editingCategory.value.id, payload, closeCategoryModal);
  } else {
    await createCategory(payload, closeCategoryModal);
  }
});

watch(
  [isCategoryModalOpen, editingCategory],
  ([isOpen]) => {
    if (isOpen) syncForm();
  },
  { immediate: true }
);
</script>

<template>
  <Dialog
    :visible="isCategoryModalOpen"
    :header="isEditing ? 'Редагувати категорію' : 'Створити категорію'"
    :modal="true"
    :closable="!isSubmitting"
    class="p-fluid w-full max-w-28rem"
    @update:visible="(val) => { if (!isSubmitting) isCategoryModalOpen = val }"
  >
    <form @submit.prevent="onSubmit" class="flex flex-column gap-3 pt-2">
      <!-- Назва -->
      <div class="flex flex-column gap-1">
        <label for="title" class="font-semibold text-sm">Назва категорії</label>
        <InputText
          id="title"
          v-model="title"
          placeholder="наприклад, Новини"
          :invalid="!!errors.title"
          :disabled="isSubmitting"
        />
        <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
      </div>

      <!-- Опис -->
      <div class="flex flex-column gap-1">
        <label for="description" class="font-semibold text-sm">Опис</label>
        <Textarea
          id="description"
          v-model="description"
          rows="3"
          autoResize
          placeholder="Короткий опис категорії..."
          :invalid="!!errors.description"
          :disabled="isSubmitting"
        />
        <small v-if="errors.description" class="text-red-500">{{ errors.description }}</small>
      </div>

      <!-- Дії -->
      <div class="flex justify-content-end gap-2 mt-3">
        <Button
          label="Скасувати"
          icon="pi pi-times"
          text
          severity="secondary"
          :disabled="isSubmitting"
          @click="closeCategoryModal()"
        />
        <Button
          type="submit"
          :label="submitButtonLabel"
          style="min-width: 10rem"
          icon="pi pi-check"
          :loading="isSubmitting"
        />
      </div>
    </form>
  </Dialog>
</template>
