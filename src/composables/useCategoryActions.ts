import {ref, type Ref} from "vue";
import { useCategoryStore } from '@/stores/categories';
import { useCrudActions } from '@/composables/useCrudActions';
import type { Category, CreateCategoryInput } from '@/types';

const isCategoryModalOpen = ref(false);
const editingCategory = ref<Category | null>(null);

export function useCategoryActions() {
  const categoryStore = useCategoryStore();

  const crud = useCrudActions<Category, CreateCategoryInput>({
    entityName: 'категорію',
    getItemDisplayTitle: (category) => category.title,
    createFn: (payload) => categoryStore.createCategory(payload),
    updateFn: (id, payload) => categoryStore.updateCategory(id, payload),
    deleteFn: (id) => categoryStore.deleteCategory(id),
    getError: () => categoryStore.error,

    isModalOpen: isCategoryModalOpen,
    editingItem: editingCategory as Ref<Category | null>,
  });

  return {
    isCategoryModalOpen,
    editingCategory,
    isSubmitting: crud.isSubmitting,
    openCategoryModal: crud.openModal,
    closeCategoryModal: crud.closeModal,
    createCategory: crud.createItem,
    updateCategory: crud.updateItem,
    deleteCategory: crud.deleteItem,
  };
}
