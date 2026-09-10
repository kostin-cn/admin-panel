import {ref, type Ref} from "vue";
import { useUserStore } from '@/stores/users';
import { useCrudActions } from '@/composables/useCrudActions';
import type { User, CreateUserInput } from '@/types';

const isUserModalOpen = ref(false);
const editingUser = ref<User | null>(null);

export function useUserActions() {
  const userStore = useUserStore();

  const crud = useCrudActions<User, CreateUserInput>({
    entityName: 'користувача',
    getItemDisplayTitle: (user) => user.name,
    createFn: (payload) => userStore.createUser(payload),
    updateFn: (id, payload) => userStore.updateUser(id as string, payload),
    deleteFn: (id) => userStore.deleteUser(id as string),
    getError: () => userStore.error,

    isModalOpen: isUserModalOpen,
    editingItem: editingUser as Ref<User | null>,
  });

  return {
    isUserModalOpen,
    editingUser,
    isSubmitting: crud.isSubmitting,
    openUserModal: crud.openModal,
    closeUserModal: crud.closeModal,
    createUser: crud.createItem,
    updateUser: crud.updateItem,
    deleteUser: crud.deleteItem,
  };
}
