<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Select from 'primevue/select'; // У PrimeVue v3 використовуйте імпорт 'primevue/dropdown'

import { useUserStore } from '@/stores/users';
import { useCategoryStore } from '@/stores/categories';
import UserFormModal from '@/components/users/UserFormModal.vue';
import { useUserActions } from '@/composables/useUserActions';
import { Role } from '@/types';

const userStore = useUserStore();
const categoryStore = useCategoryStore();

const {
  isUserModalOpen,
  openUserModal,
  deleteUser,
} = useUserActions();

onMounted(() => {
  userStore.fetchUsers();
  categoryStore.fetchCategories();
});

const categoryMap = computed(() => {
  return new Map(categoryStore.categories.map((c) => [c.id, c.title]));
});

const getRoleSeverity = (role: Role) => {
  return role === Role.ADMIN ? 'danger' : 'info';
};

const getRoleLabel = (role: Role) => {
  return role === Role.ADMIN ? 'Адміністратор' : 'Менеджер';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Пошук та фільтрація користувачів
const searchQuery = ref('');
const selectedRole = ref<Role | null>(null);

const roleOptions = [
  { label: 'Адміністратор', value: Role.ADMIN },
  { label: 'Менеджер', value: Role.MANAGER },
];

const filteredUsers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase();

  return userStore.users.filter((u) => {
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = !selectedRole.value || u.role === selectedRole.value;

    return matchesSearch && matchesRole;
  });
});
</script>

<template>
  <div class="flex flex-column gap-4">
    <!-- Заголовок та кнопка створення -->
    <div class="flex flex-column sm:flex-row align-items-start sm:align-items-center justify-content-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-color m-0">Користувачі</h1>
        <p class="text-color-secondary text-sm m-0 mt-1">Управління доступами та ролями користувачів</p>
      </div>
      <Button
        label="Новий користувач"
        icon="pi pi-plus"
        class="p-button-primary shadow-1"
        @click="openUserModal()"
      />
    </div>

    <!-- Таблиця даних -->
    <div class="surface-card p-4 border-round-xl shadow-1 border-1 surface-border">
      <!-- Верхній бар: пошук та фільтр по ролі -->
      <div class="flex flex-column sm:flex-row gap-3 justify-content-between align-items-stretch sm:align-items-center mb-4">
        <div class="flex flex-column sm:flex-row gap-3 w-full sm:w-auto">
          <!-- Пошуковий інпут -->
          <IconField iconPosition="left" class="w-full sm:w-20rem">
            <InputIcon class="pi pi-search" />
            <InputText
              v-model="searchQuery"
              placeholder="Пошук за ім'ям або email..."
              class="w-full"
            />
          </IconField>

          <!-- Дропдаун фільтрації за роллю -->
          <Select
            v-model="selectedRole"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Усі ролі"
            showClear
            class="w-full sm:w-14rem"
          />
        </div>
      </div>

      <DataTable
        :value="filteredUsers"
        :loading="userStore.isLoading"
        paginator
        :rows="25"
        responsiveLayout="scroll"
        class="p-datatable-sm"
      >
        <!-- Слот для порожнього стану в PrimeVue v4 -->
        <template #empty>
          <div class="flex flex-column align-items-center justify-content-center p-4 text-color-secondary" style="min-height: 5rem">
            <span class="font-medium">{{ userStore.isLoading ? '' : 'Користувачів не знайдено' }}</span>
          </div>
        </template>

        <!-- Слот для стану завантаження (за бажанням) -->
        <template #loading>
          <div class="flex align-items-center justify-content-center pb-4">
            <i class="pi pi-spin pi-spinner text-2xl mr-2"></i>
            <span>Завантаження користувачів...</span>
          </div>
        </template>

        <!-- Користувач -->
        <Column field="name" header="Користувач" sortable>
          <template #body="{ data }">
            <div class="flex flex-column">
              <span class="font-semibold text-color">{{ data.name }}</span>
              <span class="text-xs text-color-secondary">{{ data.email }}</span>
            </div>
          </template>
        </Column>

        <!-- Роль -->
        <Column field="role" header="Роль" sortable>
          <template #body="{ data }">
            <Tag :value="getRoleLabel(data.role)" :severity="getRoleSeverity(data.role)" />
          </template>
        </Column>

        <!-- Категорії -->
        <Column header="Доступні категорії">
          <template #body="{ data }">
            <span v-if="data.role === Role.ADMIN" class="text-xs text-color-secondary italic">
              Усі категорії (Admin)
            </span>
            <template v-else-if="data.allowedCategoryIds?.length">
              <Tag
                v-for="catId in data.allowedCategoryIds"
                :key="catId"
                :value="categoryMap.get(catId) ?? catId"
                severity="secondary"
                class="mr-1 text-xs"
              />
            </template>
            <span v-else class="text-xs text-color-secondary italic">Не призначено</span>
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
                @click="openUserModal(data)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                severity="danger"
                aria-label="Видалити"
                @click="deleteUser(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Модальне вікно створення / редагування -->
    <UserFormModal v-if="isUserModalOpen" />
  </div>
</template>
