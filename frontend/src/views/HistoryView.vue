<script setup>
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getUserQuizAttempts } from '@/services/quizHistory'
import BaseButton from '@/components/BaseButton.vue'

const { t, locale } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const attempts = ref([])
const loading = ref(true)
const errorMessage = ref('')

const hasAttempts = computed(() => attempts.value.length > 0)

function formatDate(value) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function openAttempt(attempt) {
  router.push({ name: 'saved-result', params: { attemptId: attempt.id } })
}

async function loadHistory() {
  loading.value = true
  errorMessage.value = ''

  try {
    await auth.init()
    if (!auth.user?.id) {
      await router.replace({ name: 'login', query: { redirect: '/historico' } })
      return
    }
    attempts.value = await getUserQuizAttempts(auth.user.id)
  } catch (error) {
    errorMessage.value = error.message || t('error.history.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(loadHistory)
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
    <header>
      <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft sm:text-3xl">{{ t('history.title') }}</h1>
      <p class="mt-2 text-lagoon/65 dark:text-cream-soft/65">{{ t('history.subtitle') }}</p>
    </header>

    <div v-if="loading" class="mt-8 rounded-xl2 bg-cream p-6 text-center text-lagoon/65 shadow-soft dark:bg-lagoon-light/40 dark:text-cream-soft/65 dark:shadow-softDark" role="status">
      {{ t('history.loading') }}
    </div>

    <div v-else-if="errorMessage" class="mt-8 rounded-xl2 border border-error/30 bg-error-bg p-6 text-center dark:bg-error-bgDark" role="alert">
      <p class="font-semibold text-error">{{ errorMessage }}</p>
      <BaseButton class="mt-4" @click="loadHistory">{{ t('history.retry') }}</BaseButton>
    </div>

    <div v-else-if="!hasAttempts" class="mt-8 rounded-blob bg-blush-soft px-6 py-10 text-center dark:bg-lagoon-light/40">
      <p class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('history.emptyTitle') }}</p>
      <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('history.emptyBody') }}</p>
      <BaseButton class="mt-5" @click="router.push('/enviar')">{{ t('history.newQuiz') }}</BaseButton>
    </div>

    <div v-else class="mt-7 space-y-4">
      <button
        v-for="attempt in attempts"
        :key="attempt.id"
        type="button"
        class="group w-full rounded-xl2 bg-cream p-5 text-left shadow-soft transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rosewood dark:bg-lagoon-light/40 dark:shadow-softDark"
        @click="openAttempt(attempt)"
      >
        <span class="flex items-center justify-between gap-4">
          <div class="min-w-0">
            <h2 class="truncate font-display font-semibold text-lagoon dark:text-cream-soft">{{ attempt.title || formatDate(attempt.startedAt) }}</h2>
            <p class="mt-1 text-sm text-lagoon/60 dark:text-cream-soft/60">{{ formatDate(attempt.startedAt) }}</p>
          </div>
          <svg class="shrink-0 transition-transform group-hover:translate-x-1" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 18 6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </span>
        <span class="mt-3 block text-sm text-lagoon/60 dark:text-cream-soft/60">{{ attempt.correctAnswers }} {{ t('result.correct') }} / {{ attempt.totalQuestions }} {{ t('history.questions') }}</span>
      </button>
    </div>
  </section>
</template>