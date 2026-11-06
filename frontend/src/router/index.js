import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { PENDING_QUIZ_SAVE_KEY } from '@/services/pendingQuizSave'

import HomeView from '@/views/HomeView.vue'
import UploadView from '@/views/UploadView.vue'
import GeneratingView from '@/views/GeneratingView.vue'
import QuizView from '@/views/QuizView.vue'
import GradingView from '@/views/GradingView.vue'
import ResultView from '@/views/ResultView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/enviar', name: 'upload', component: UploadView },
    { path: '/gerando', name: 'generating', component: GeneratingView },
    { path: '/quiz', name: 'quiz', component: QuizView },
    { path: '/corrigindo', name: 'grading', component: GradingView },
    { path: '/resultado', name: 'result', component: ResultView },
    { path: '/resultado/:attemptId', name: 'saved-result', component: ResultView, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/perfil', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/historico', name: 'historico', component: () => import('@/views/HistoryView.vue'), meta: { requiresAuth: true } },
    { path: '/estatisticas', name: 'estatisticas', component: () => import('@/views/StatisticsView.vue'), meta: { requiresAuth: true } }
  ],

  scrollBehavior() {
    return { top: 0 }
  },
})

// Rotas com meta.requiresAuth vão pedir login; 
// meta.guestOnly redireciona quem já entrou
router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth && !to.meta.guestOnly) {
    if (to.name === 'home' && sessionStorage.getItem(PENDING_QUIZ_SAVE_KEY)) {
      const auth = useAuthStore()
      await auth.init()
      if (auth.isAuthenticated) return { name: 'result', query: { save: '1' } }
    }
    return true
  }

  const auth = useAuthStore()
  await auth.init()

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'home' }
  }
  return true
})

export default router
