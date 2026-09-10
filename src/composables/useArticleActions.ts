import {ref, type Ref} from "vue";
import { useArticleStore } from '@/stores/articles';
import { useCrudActions } from '@/composables/useCrudActions';
import type { Article, CreateArticleInput } from '@/types';

const isArticleModalOpen = ref(false);
const editingArticle = ref<Article | null>(null);

export function useArticleActions() {
  const articleStore = useArticleStore();

  const crud = useCrudActions<Article, CreateArticleInput>({
    entityName: 'статтю',
    getItemDisplayTitle: (article) => article.title,
    createFn: (payload) => articleStore.createArticle(payload),
    updateFn: (id, payload) => articleStore.updateArticle(id as string, payload),
    deleteFn: (id) => articleStore.deleteArticle(id as string),
    getError: () => articleStore.error,

    isModalOpen: isArticleModalOpen,
    editingItem: editingArticle as Ref<Article | null>,
  });

  return {
    isArticleModalOpen,
    editingArticle,
    isSubmitting: crud.isSubmitting,
    openArticleModal: crud.openModal,
    closeArticleModal: crud.closeModal,
    createArticle: crud.createItem,
    updateArticle: crud.updateItem,
    deleteArticle: crud.deleteItem,
  };
}
