import { defineStore } from 'pinia'
import { ref } from 'vue'
import { usersApi } from '@/api/users'
import type { User, CreateUserInput } from '@/types'

export const useUserStore = defineStore('users', () => {

  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchUsers() {
    isLoading.value = true
    error.value = null
    try {
      users.value = await usersApi.getAll()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка завантаження користувачів'
      throw err;
    } finally {
      isLoading.value = false
    }
  }

  async function fetchUserById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      currentUser.value = await usersApi.getById(id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Користувача не знайдено'
      currentUser.value = null
    } finally {
      isLoading.value = false
    }
  }

  async function createUser(input: CreateUserInput) {
    try {
      const newUser = await usersApi.create(input)
      users.value.push(newUser)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка створення користувача'
      throw err
    }
  }

  async function updateUser(id: string, payload: Partial<User>) {
    try {
      const updated = await usersApi.update(id, payload)

      const index = users.value.findIndex(p => p.id === id)
      if (index !== -1) users.value[index] = updated

      if (currentUser.value?.id === id) {
        currentUser.value = updated
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка оновлення користувача'
      throw err
    }
  }

  async function deleteUser(id: string) {
    try {
      await usersApi.delete(id)
      users.value = users.value.filter(p => p.id !== id)
      if (currentUser.value?.id === id) {
        currentUser.value = null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Помилка видалення користувача'
      throw err
    }
  }

  return {
    users,
    currentUser,
    isLoading,
    error,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser
  }
})
