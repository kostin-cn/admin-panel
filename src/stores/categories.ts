import { defineStore } from 'pinia'
import { ref } from 'vue'
import { categoriesApi } from '@/api/categories'
import type { Category, CreateCategoryInput } from '@/types'

export const useCategoryStore = defineStore('categories', () => {

  const categories = ref<Category[]>([])
  const currentCategory = ref<Category | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    isLoading.value = true
    error.value = null
    try {
      categories.value = await categoriesApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка завантаження категорій'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchCategoryById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      currentCategory.value = await categoriesApi.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Категорію не знайдено'
      currentCategory.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function createCategory(input: CreateCategoryInput) {
    try {
      const newCategory = await categoriesApi.create(input)
      categories.value.push(newCategory)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка створення категорії'
      throw err
    }
  }

  async function updateCategory(id: number, payload: Partial<Category>) {
    try {
      const updated = await categoriesApi.update(id, payload)

      const index = categories.value.findIndex(p => p.id === id)
      if (index !== -1) categories.value[index] = updated

      if (currentCategory.value?.id === id) {
        currentCategory.value = updated
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка оновлення категорії'
      throw err
    }
  }

  async function deleteCategory(id: number) {
    try {
      await categoriesApi.delete(id)
      categories.value = categories.value.filter(p => p.id !== id)
      if (currentCategory.value?.id === id) {
        currentCategory.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка видалення категорії'
      throw err
    }
  }

  return {
    categories,
    currentCategory,
    isLoading,
    error,
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
