import {type Ref, ref} from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';

interface Identifiable {
  id: string | number;
}

export interface CrudOptions<T extends Identifiable, CreateInput, UpdateInput = CreateInput> {
  /** Назва сутності у знахідному/родовому відмінку для повідомлень (наприклад: "користувача", "категорію") */
  entityName: string;
  /** Функція для отримання імені об'єкта у вікні підтвердження видалення (наприклад: u => u.name або a => a.title) */
  getItemDisplayTitle: (item: T) => string;
  /** Функції роботи зі стором або API */
  createFn: (payload: CreateInput) => Promise<unknown>;
  updateFn: (id: T['id'], payload: UpdateInput) => Promise<unknown>;
  deleteFn: (id: T['id']) => Promise<unknown>;
  /** Геттер помилки зі стору */
  getError?: () => string | null;

  isModalOpen?: Ref<boolean>;
  editingItem?: Ref<T | null>;

  /** Опціональні кастомні повідомлення, якщо дефолтні не підходять */
  messages?: {
    createSuccess?: string;
    updateSuccess?: string;
    deleteSuccess?: string;
  };
}

export function useCrudActions<T extends Identifiable, CreateInput, UpdateInput = CreateInput>(
  options: CrudOptions<T, CreateInput, UpdateInput>
) {
  const toast = useToast();
  const confirm = useConfirm();
  const isModalOpen = options.isModalOpen ?? ref(false);
  const editingItem = options.editingItem ?? (ref(null) as Ref<T | null>);

  const isSubmitting = ref(false);

  const openModal = (item: T | null = null) => {
    editingItem.value = item ? ({ ...item } as T) : null;
    isModalOpen.value = true;
  };

  const closeModal = () => {
    isModalOpen.value = false;
    editingItem.value = null;
  };

  async function createItem(payload: CreateInput, onSuccess?: () => void) {
    isSubmitting.value = true;
    try {
      await options.createFn(payload);
      toast.add({
        severity: 'success',
        summary: 'Успішно',
        detail: options.messages?.createSuccess ?? `${capitalize(options.entityName)} успішно створено`,
        life: 3000,
      });
      onSuccess?.();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Помилка',
        detail: options.getError?.() || `Не вдалося створити ${options.entityName}`,
        life: 4000,
      });
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  }

  async function updateItem(id: T['id'], payload: UpdateInput, onSuccess?: () => void) {
    isSubmitting.value = true;
    try {
      await options.updateFn(id, payload);
      toast.add({
        severity: 'success',
        summary: 'Успішно',
        detail: options.messages?.updateSuccess ?? `${capitalize(options.entityName)} успішно оновлено`,
        life: 3000,
      });
      onSuccess?.();
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Помилка',
        detail: options.getError?.() || `Не вдалося зберегти ${options.entityName}`,
        life: 4000,
      });
      throw error;
    } finally {
      isSubmitting.value = false;
    }
  }

  const deleteItem = (item: T) => {
    const title = options.getItemDisplayTitle(item);

    confirm.require({
      message: `Ви дійсно бажаєте видалити "${title}"?`,
      header: 'Підтвердження видалення',
      icon: 'pi pi-exclamation-triangle',
      rejectProps: {
        label: 'Скасувати',
        severity: 'secondary',
        outlined: true,
      },
      acceptProps: {
        label: 'Видалити',
        severity: 'danger',
      },
      accept: async () => {
        try {
          await options.deleteFn(item.id);
          toast.add({
            severity: 'success',
            summary: 'Успішно',
            detail: options.messages?.deleteSuccess ?? `${capitalize(options.entityName)} видалено`,
            life: 3000,
          });
        } catch (error) {
          toast.add({
            severity: 'error',
            summary: 'Помилка',
            detail: options.getError?.() || `Не вдалося видалити ${options.entityName}`,
            life: 4000,
          });
          throw error;
        }
      },
    });
  };

  return {
    isModalOpen,
    editingItem,
    isSubmitting,
    openModal,
    closeModal,
    createItem,
    updateItem,
    deleteItem,
  };
}

// Хелпер для роблення першої літери великою
function capitalize(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
