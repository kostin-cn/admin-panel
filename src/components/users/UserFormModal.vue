<script setup lang="ts">
import { watch, computed } from 'vue';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import MultiSelect from 'primevue/multiselect';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useUserActions } from '@/composables/useUserActions';
import { useCategoryStore } from "@/stores/categories.ts";
import { Role } from '@/types';

const categoryStore = useCategoryStore();

const {
  isUserModalOpen,
  editingUser,
  closeUserModal,
  createUser,
  updateUser,
  isSubmitting
} = useUserActions();

const isEditing = computed(() => !!editingUser.value?.id)

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) {
    return isEditing.value ? 'Збереження...' : 'Створення...';
  }
  return isEditing.value ? 'Зберегти' : 'Створити';
});

// Zod-схема валідації
const userSchema = toTypedSchema(
  z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Ім'я є обов'язковим")
        .max(100, "Ім'я не повинно перевищувати 100 символів"),
      email: z
        .string()
        .trim()
        .min(1, "Email є обов'язковим")
        .email('Введіть коректний email'),
      role: z.nativeEnum(Role, {
        errorMap: () => ({ message: 'Оберіть роль користувача' }),
      }),
      allowedCategoryIds: z.array(z.string().or(z.number())),
    })
    .superRefine((data, ctx) => {
      // Якщо обрано роль Менеджера — категорій має бути мінімум 1
      if (data.role === Role.MANAGER && data.allowedCategoryIds.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Менеджеру потрібно призначити хоча б одну категорію',
          path: ['allowedCategoryIds'],
        });
      }
    })
);

// Ініціалізація форми
const { handleSubmit, errors, resetForm, defineField } = useForm({
  validationSchema: userSchema,
  initialValues: {
    name: '',
    email: '',
    role: Role.MANAGER,
    allowedCategoryIds: []
  }
})

const fieldOpts = { validateOnBlur: true };

const [name] = defineField('name', fieldOpts);
const [email] = defineField('email', fieldOpts);
const [role] = defineField('role', fieldOpts);
const [allowedCategoryIds] = defineField('allowedCategoryIds', fieldOpts);

function syncForm() {
  if (editingUser.value) {
    resetForm({
      values: {
        name: editingUser.value.name || '',
        email: editingUser.value.email || '',
        role: editingUser.value.role || Role.MANAGER,
        allowedCategoryIds: editingUser.value.allowedCategoryIds || [],
      }
    })
  } else {
    resetForm({
      values: {
        name: '',
        email: '',
        role: Role.MANAGER,
        allowedCategoryIds: []
      }
    })
  }
}

const roleOptions = [
  { label: 'Адміністратор', value: Role.ADMIN },
  { label: 'Менеджер', value: Role.MANAGER }
];

// handleSubmit спрацьовує при submit і провалідовує всі поля одразу
const onSubmit = handleSubmit(async (values) => {
  const payload = {
    name: values.name.trim(),
    email: values.email.trim(),
    role: values.role,
    allowedCategoryIds: values.role === Role.ADMIN ? [] : values.allowedCategoryIds as string[],
  }

  if (editingUser.value?.id) {
    await updateUser(editingUser.value.id, payload, closeUserModal)
  } else {
    await createUser(payload, closeUserModal)
  }
})

watch(
  [isUserModalOpen, editingUser],
  ([isOpen]) => {
    if (isOpen) syncForm()
  },
  { immediate: true }
)
</script>

<template>
  <Dialog
    :visible="isUserModalOpen"
    :header="isEditing ? 'Редагувати користувача' : 'Створити користувача'"
    :modal="true"
    :closable="!isSubmitting"
    class="p-fluid w-full max-w-28rem"
    @update:visible="(val) => { if (!isSubmitting) isUserModalOpen = val }"
  >
    <form @submit.prevent="onSubmit" class="flex flex-column gap-3 pt-2">
      <!-- Ім'я -->
      <div class="flex flex-column gap-1">
        <label for="name" class="font-semibold text-sm">Ім'я та Прізвище</label>
        <InputText
          id="name"
          v-model="name"
          placeholder="Олександр Коваль"
          :invalid="!!errors.name"
          :disabled="isSubmitting"
        />
        <small v-if="errors.name" class="text-red-500">{{ errors.name }}</small>
      </div>

      <!-- Email -->
      <div class="flex flex-column gap-1">
        <label for="email" class="font-semibold text-sm">Email</label>
        <InputText
          id="email"
          v-model="email"
          type="email"
          placeholder="user@example.com"
          :invalid="!!errors.email"
          :disabled="isSubmitting"
        />
        <small v-if="errors.email" class="text-red-500">{{ errors.email }}</small>
      </div>

      <!-- Роль -->
      <div class="flex flex-column gap-1">
        <label for="role" class="font-semibold text-sm">Роль у системі</label>
        <Select
          id="role"
          v-model="role"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Оберіть роль"
          :disabled="isSubmitting"
        />
      </div>

      <!-- Дозволені категорії (тільки для MANAGER) -->
      <div v-if="role === Role.MANAGER" class="flex flex-column gap-1">
        <label for="categories" class="font-semibold text-sm">Доступні категорії</label>
        <MultiSelect
          id="categories"
          v-model="allowedCategoryIds"
          :options="categoryStore.categories"
          optionLabel="title"
          optionValue="id"
          placeholder="Оберіть категорії"
          display="chip"
          class="w-full"
          :disabled="isSubmitting"
          :invalid="!!errors.allowedCategoryIds"
        />
        <small v-if="errors.allowedCategoryIds" class="text-red-500">
          {{ errors.allowedCategoryIds }}
        </small>
        <small v-else class="text-color-secondary">
          Менеджер зможе бачити лише ці категорії
        </small>
      </div>

      <Message v-else severity="info" :closable="false" class="text-xs my-0">
        Адміністратор має доступ до всіх категорій за замовчуванням.
      </Message>

      <!-- Дії -->
      <div class="flex justify-content-end gap-2 mt-3">
        <Button
          label="Скасувати"
          icon="pi pi-times"
          text
          severity="secondary"
          :disabled="isSubmitting"
          @click="closeUserModal()"
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
