import { defineStore } from 'pinia'
import { ref } from 'vue'
import { articlesApi } from '@/api/articles'
import type {Article, CreateArticleInput} from '@/types'

export const useArticleStore = defineStore('articles', () => {
  const articles = ref<Article[]>([])
  const currentArticle = ref<Article | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAllArticles() {
    isLoading.value = true
    error.value = null
    try {
      articles.value = await articlesApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка завантаження статей'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchArticleById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      currentArticle.value = await articlesApi.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Статтю не знайдено'
      currentArticle.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function createArticle(input: CreateArticleInput) {
    try {
      const newArticle = await articlesApi.create(input)
      articles.value.push(newArticle)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка створення статті'
      throw err
    }
  }

  async function updateArticle(id: number, payload: Partial<Article>) {
    try {
      const updatedArticle = await articlesApi.update(id, payload)
      const index = articles.value.findIndex(t => t.id === id)
      if (index !== -1) {
        articles.value[index] = updatedArticle
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка оновлення статті'
      throw err
    }
  }

  async function deleteArticle(id: number) {
    try {
      await articlesApi.delete(id)
      articles.value = articles.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка видалення статті'
      throw err
    }
  }

  return {
    articles,
    currentArticle,
    isLoading,
    error,
    fetchAllArticles,
    fetchArticleById,
    createArticle,
    updateArticle,
    deleteArticle,
  }
})
