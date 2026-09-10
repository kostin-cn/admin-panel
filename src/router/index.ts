import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: { render: () => null },
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/UsersView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/CategoriesView.vue'),
          meta: { requiresAdmin: true },
        },
        {
          path: 'articles',
          name: 'articles',
          component: () => import('@/views/ArticlesView.vue'),
        },
        {
          path: 'articles/:id',
          name: 'article-detail',
          component: () => import('@/views/ArticleEditView.vue'),
        },
      ],
    },
    {
      // Catch-all 404
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

// Navigation Guard
router.beforeEach((to) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth !== false);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);

  // Спроба зайти на захищений роут без авторизації
  if (requiresAuth && !authStore.isAuthenticated) {
    const isHomePage = to.path === '/' || to.name === 'home';
    return {
      name: 'login',
      ...(!isHomePage && {query: { redirect: to.fullPath }})
    };
  }

  // Авторизований користувач намагається зайти на /login
  if (to.name === 'login' && authStore.isAuthenticated) {
    return authStore.isAdmin ? { name: 'users' } : { name: 'articles' };
  }

  // Менеджер намагається зайти на адмінський роут (requiresAdmin)
  if (requiresAdmin && !authStore.isAdmin) {
    return { name: 'articles' };
  }

  if (to.name === 'home') {
    return authStore.isAdmin ? { name: 'users' } : { name: 'articles' };
  }

  return true;
});

export default router;
