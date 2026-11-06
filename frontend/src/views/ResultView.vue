<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import { useAuthStore } from '@/stores/auth'
import { getUserQuizAttempt, saveQuizAttempt } from '@/services/quizHistory'
import { PENDING_QUIZ_SAVE_KEY } from '@/services/pendingQuizSave'
import BaseButton from '../components/BaseButton.vue'
import StatusBadge from '../components/StatusBadge.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const quiz = useQuizStore()
const auth = useAuthStore()
const historicalAttempt = ref(null)
const loadingAttempt = ref(false)
const loadError = ref('')
const saving = ref(false)
const saveError = ref('')
const saveName = ref('')
const showSaveForm = ref(false)
const savedMessage = ref(false)

const isHistoricalResult = computed(() => Boolean(route.params.attemptId))
const isSaved = computed(() => Boolean(historicalAttempt.value?.id || quiz.savedAttemptId))

watch(
  () => route.params.attemptId,
  async (attemptId) => {
    historicalAttempt.value = null
    loadError.value = ''

    if (!attemptId) {
      return
    }

    loadingAttempt.value = true
    try {
      await auth.init()
      if (!auth.user?.id) {
        await router.replace({ name: 'login', query: { redirect: route.fullPath } })
        return
      }
      historicalAttempt.value = await getUserQuizAttempt(auth.user.id, String(attemptId))
      if (!historicalAttempt.value) loadError.value = t('history.attemptNotFound')
    } catch (error) {
      loadError.value = error.message || t('error.history.loadFailed')
    } finally {
      loadingAttempt.value = false
    }
  },
  { immediate: true },
)

onMounted(async () => {
  await auth.init()

  if (!quiz.result) {
    const pendingSnapshot = sessionStorage.getItem(PENDING_QUIZ_SAVE_KEY)
    if (pendingSnapshot) {
      try {
        quiz.restorePendingResult(JSON.parse(pendingSnapshot))
      } catch (error) {
        console.error('Failed to restore pending quiz save', error)
        sessionStorage.removeItem(PENDING_QUIZ_SAVE_KEY)
      }
    }
  }

  if (!isHistoricalResult.value && !quiz.result) {
    await router.replace('/')
    return
  }

  if (route.query.save === '1' && quiz.result) {
    if (auth.isAuthenticated) {
      showSaveForm.value = true
    } else {
      await router.replace({
        name: 'login',
        query: { redirect: '/resultado?save=1' },
      })
    }
  }
})

const result = computed(() => isHistoricalResult.value ? historicalAttempt.value : quiz.result)
const counts = computed(() => {
  if (!result.value) return { correct: 0, incorrect: 0, unanswered: 0 }
  return result.value.questions.reduce(
    (acc, question) => {
      acc[question.status] += 1
      return acc
    },
    { correct: 0, incorrect: 0, unanswered: 0 },
  )
})

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function preservePendingResult() {
  const recordings = Object.fromEntries(
    Object.entries(quiz.recordings).map(([id, recording]) => [
      id,
      {
        mode: recording.mode,
        textAnswer: recording.textAnswer,
        transcript: recording.transcript,
        elapsed: recording.elapsed,
      },
    ]),
  )

  sessionStorage.setItem(PENDING_QUIZ_SAVE_KEY, JSON.stringify({
    sourceFile: quiz.file?.name ?? '',
    chapter: quiz.chapter,
    difficulty: quiz.difficulty,
    questions: quiz.questions,
    recordings,
    result: quiz.result,
  }))
}

async function requestSave() {
  await auth.init()
  if (auth.isAuthenticated) {
    showSaveForm.value = true
    return
  }

  try {
    preservePendingResult()
    await router.push({
      name: 'login',
      query: { redirect: '/resultado?save=1' },
    })
  } catch (error) {
    console.error('Failed to preserve quiz before sign-in', error)
    saveError.value = t('error.history.pendingSaveFailed')
  }
}

async function saveResult() {
  saveError.value = ''
  saving.value = true

  try {
    await auth.init()
    if (!auth.user?.id) {
      preservePendingResult()
      await router.push({
        name: 'login',
        query: { redirect: '/resultado?save=1' },
      })
      return
    }
    const attemptId = await saveQuizAttempt({
      userId: auth.user.id,
      title: saveName.value,
      source: quiz.file?.name,
      topic: quiz.chapter,
      difficulty: quiz.difficulty,
      questions: quiz.questions,
      recordings: quiz.recordings,
      result: quiz.result,
    })
    quiz.savedAttemptId = attemptId
    sessionStorage.removeItem(PENDING_QUIZ_SAVE_KEY)
    savedMessage.value = true
    showSaveForm.value = false
    if (route.query.save === '1') await router.replace({ name: 'result' })
  } catch (error) {
    saveError.value = error.message || t('error.history.saveFailed')
  } finally {
    saving.value = false
  }
}

function startNewQuiz() {
  quiz.resetQuiz()
  router.push('/enviar')
}
</script>

<template>
  <div v-if="loadingAttempt" class="mx-auto max-w-2xl px-4 py-10 text-center text-lagoon/65 dark:text-cream-soft/65" role="status">
    {{ t('history.loading') }}
  </div>
  <div v-else-if="loadError" class="mx-auto max-w-2xl px-4 py-10 text-center" role="alert">
    <p class="font-semibold text-error">{{ loadError }}</p>
    <BaseButton class="mt-4" @click="router.push('/historico')">{{ t('history.backToHistory') }}</BaseButton>
  </div>
  <div v-if="result" class="mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
    <h1 class="text-2xl font-semibold text-lagoon dark:text-cream-soft sm:text-3xl">{{ t('result.title') }}</h1>

    <div class="mt-6 flex flex-col items-center rounded-blob bg-blush-soft px-6 py-10 text-center dark:bg-lagoon-light/40">
      <p class="text-sm font-semibold uppercase tracking-wide text-rosewood/80">{{ t('result.totalScoreLabel') }}</p>
      <p class="mt-1 font-display text-5xl font-bold text-lagoon dark:text-cream-soft">
        {{ result.totalScore }}<span class="text-2xl text-lagoon/40 dark:text-cream-soft/40">/{{ result.maxScore }}</span>
      </p>
      <div class="mt-6 flex flex-wrap justify-center gap-3">
        <span class="rounded-full bg-success-bg px-4 py-1.5 text-sm font-semibold text-success dark:bg-success-bgDark dark:text-sage-light">{{ counts.correct }} {{ t('result.correct') }}</span>
        <span class="rounded-full bg-error-bg px-4 py-1.5 text-sm font-semibold text-error dark:bg-error-bgDark dark:text-blush">{{ counts.incorrect }} {{ t('result.incorrect') }}</span>
        <span class="rounded-full bg-warning-bg px-4 py-1.5 text-sm font-semibold text-warning dark:bg-warning-bgDark">{{ counts.unanswered }} {{ t('result.unanswered') }}</span>
      </div>
    </div>

    <h2 class="mt-10 font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('result.questionsTitle') }}</h2>

    <div class="mt-4 space-y-4">
      <details
        v-for="(q, index) in result.questions"
        :key="q.id"
        class="group rounded-xl2 bg-cream p-5 shadow-soft open:pb-6 dark:bg-lagoon-light/40 dark:shadow-softDark"
        :open="index === 0"
      >
        <summary class="flex cursor-pointer list-none items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-lagoon/10 font-display text-sm font-semibold text-lagoon dark:bg-cream-soft/10 dark:text-cream-soft">{{ index + 1 }}</span>
            <p class="font-semibold text-lagoon dark:text-cream-soft">{{ q.prompt }}</p>
          </div>
          <svg class="shrink-0 transition-transform group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </summary>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <StatusBadge :status="q.status" />
          <span class="text-sm text-lagoon/55 dark:text-cream-soft/55">{{ q.score }}/{{ q.maxScore }} pts</span>
          <span v-if="q.durationSeconds !== undefined" class="flex items-center gap-1 text-sm text-lagoon/55 dark:text-cream-soft/55">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            {{ t('result.timeSpent') }}: {{ formatTime(q.durationSeconds) }}
          </span>
        </div>

        <div class="mt-4 space-y-3 text-sm">
          <div
            class="rounded-lg p-3"
            :class="{
              'border border-[#B7CDA5] bg-[#F1F7EC] dark:border-success/50 dark:bg-success-bgDark': q.status === 'correct',
              'border border-[#E9B7BB] bg-[#FDF0F0] dark:border-error/30 dark:bg-error-bgDark': q.status === 'incorrect',
              'bg-cream-soft dark:bg-lagoon-soft/50': q.status === 'unanswered',
            }"
          >
            <p
              class="font-semibold"
              :class="{
                'text-[#42652D] dark:text-[#b5d495]': q.status === 'correct',
                'text-[#9C3F49] dark:text-blush': q.status === 'incorrect',
                'text-lagoon/70 dark:text-cream-soft/70': q.status === 'unanswered',
              }"
            >{{ t('result.yourAnswer') }}</p>
            <p
              class="mt-1"
              :class="{
                'text-[#42652D] dark:text-[#b5d495]': q.status === 'correct',
                'text-[#9C3F49] dark:text-blush': q.status === 'incorrect',
                'text-lagoon/70 dark:text-cream-soft/70': q.status === 'unanswered',
              }"
            >
              {{ q.status === 'unanswered' ? t('result.noAnswer') : q.studentAnswerLabel }}
            </p>
          </div>
          <div v-if="q.expectedAnswer" class="rounded-lg bg-[#F5F7FA] p-3 dark:bg-lagoon-soft/50">
            <p class="font-semibold text-[#526C78] dark:text-sage-light">{{ t('result.expectedAnswer') }}</p>
            <p class="mt-1 text-lagoon/70 dark:text-cream-soft/70">{{ q.expectedAnswer }}</p>
          </div>
          <div v-if="q.status !== 'correct' && (q.mainError || q.feedback)" class="rounded-lg bg-[#FFF6E5] p-3 dark:bg-warning-bgDark">
            <p class="font-semibold text-[#7A5622] dark:text-warning">{{ t('result.whatToReview') }}</p>
            <p v-if="q.mainError" class="mt-1 text-lagoon/60 dark:text-cream-soft/60">{{ q.mainError }}</p>
            <p v-if="q.feedback && q.feedback !== q.mainError" :class="q.mainError ? 'mt-2' : 'mt-1'" class="text-lagoon/60 dark:text-cream-soft/60">{{ q.feedback }}</p>
          </div>
        </div>
      </details>
    </div>

    <div class="mt-8 flex flex-col items-center gap-5 pt-4">
      <BaseButton
        v-if="!isSaved && !isHistoricalResult"
        size="lg"
        :disabled="saving"
        @click="requestSave"
      >{{ t('result.saveQuiz') }}</BaseButton>
      <p v-if="savedMessage" class="text-sm font-semibold text-success dark:text-sage-light" role="status">{{ t('result.saved') }}</p>
      <p v-if="saveError" class="text-sm font-semibold text-error" role="alert">{{ saveError }}</p>
      <BaseButton variant="outline" size="lg" @click="startNewQuiz">{{ t('result.newQuiz') }}</BaseButton>
      <BaseButton v-if="isHistoricalResult" variant="ghost" @click="router.push('/historico')">{{ t('history.backToHistory') }}</BaseButton>
    </div>

    <div
      v-if="showSaveForm"
      class="fixed inset-0 z-30 flex items-center justify-center bg-lagoon/40 p-4 backdrop-blur-sm dark:bg-black/60"
      @click.self="showSaveForm = false"
    >
      <form
        class="w-full max-w-md rounded-xl2 bg-cream-soft p-6 shadow-soft dark:bg-lagoon-light"
        @submit.prevent="saveResult"
      >
        <h2 class="font-display text-xl font-semibold text-lagoon dark:text-cream-soft">{{ t('result.saveTitle') }}</h2>
        <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('result.saveDescription') }}</p>
        <label for="saved-quiz-name" class="mt-5 block text-sm font-semibold text-lagoon dark:text-cream-soft">{{ t('result.quizName') }}</label>
        <input
          id="saved-quiz-name"
          v-model="saveName"
          maxlength="120"
          class="mt-2 w-full rounded-lg border border-lagoon/20 bg-cream px-4 py-3 text-lagoon outline-none focus:border-rosewood focus:ring-2 focus:ring-rosewood/20 dark:border-cream-soft/20 dark:bg-lagoon-soft dark:text-cream-soft"
          :placeholder="t('result.quizNameOptional')"
        >
        <p v-if="saveError" class="mt-3 text-sm font-semibold text-error" role="alert">{{ saveError }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <BaseButton variant="ghost" :disabled="saving" @click="showSaveForm = false">{{ t('history.cancel') }}</BaseButton>
          <BaseButton type="submit" :disabled="saving">{{ saving ? t('result.saving') : t('result.saveQuiz') }}</BaseButton>
        </div>
      </form>
    </div>

    <div class="mt-10 flex flex-col items-center gap-3 rounded-blob bg-cream pt-4 pb-8 text-center dark:bg-lagoon-light/30">
      <!-- <MascotFull :size="160" /> -->
      <img class="mascote_maior max-h-[160px]" src="../../public/mascote_maior.webp" alt="Mascote">
      <p class="font-display font-semibold text-lagoon dark:text-cream-soft">{{ t('result.mascotCaption') }}</p>
    </div>
  </div>
</template>
