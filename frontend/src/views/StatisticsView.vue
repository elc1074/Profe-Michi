<script setup>
import SideBar from '../components/SideBar.vue'
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
const difficultyLevels = ['easy', 'medium', 'hard']
const difficultyPointColors = {
  easy: 'fill-success',
  medium: 'fill-warning',
  hard: 'fill-error',
}

const totalPoints = computed(() => attempts.value.reduce((sum, attempt) => sum + attempt.totalScore, 0))
const totalPossiblePoints = computed(() => attempts.value.reduce((sum, attempt) => sum + attempt.maxScore, 0))
const answeredPoints = computed(() => attempts.value.reduce(
  (sum, attempt) => sum + attempt.questions
    .filter((question) => question.studentAnswerLabel)
    .reduce((questionSum, question) => questionSum + question.score, 0),
  0,
))
const answeredPossiblePoints = computed(() => attempts.value.reduce(
  (sum, attempt) => sum + attempt.questions
    .filter((question) => question.studentAnswerLabel)
    .reduce((questionSum, question) => questionSum + question.maxScore, 0),
  0,
))
const totalPointsPercentage = computed(() => totalPossiblePoints.value
  ? Math.round(totalPoints.value / totalPossiblePoints.value * 100)
  : 0)
const answeredPointsPercentage = computed(() => answeredPossiblePoints.value
  ? Math.round(answeredPoints.value / answeredPossiblePoints.value * 100)
  : 0)
const pointsByDifficulty = computed(() => difficultyLevels.map((level) => {
  const levelAttempts = attempts.value.filter((attempt) => attempt.difficulty === level)
  const points = levelAttempts.reduce((sum, attempt) => sum + attempt.totalScore, 0)
  const possible = levelAttempts.reduce((sum, attempt) => sum + attempt.maxScore, 0)
  return {
    level,
    points,
    possible,
    percentage: possible ? Math.round(points / possible * 100) : 0,
    quizzes: levelAttempts.length,
  }
}))

const chartAttempts = computed(() => [...attempts.value].reverse())
const chartWidth = computed(() => Math.max(640, chartAttempts.value.length * 112))
const chartPoints = computed(() => {
  const width = chartWidth.value
  const left = 64
  const right = width - 32
  const top = 24
  const bottom = 236
  const denominator = Math.max(1, chartAttempts.value.length - 1)

  return chartAttempts.value.map((attempt, index) => {
    const correct = attempt.questions.filter((question) => question.status === 'correct').length
    const accuracy = attempt.totalQuestions ? correct / attempt.totalQuestions * 100 : 0
    const x = chartAttempts.value.length === 1
      ? (left + right) / 2
      : left + index * (right - left) / denominator
    return {
      attempt,
      accuracy,
      color: difficultyPointColors[attempt.difficulty] ?? 'fill-rosewood',
      x,
      y: bottom - accuracy / 100 * (bottom - top),
      label: new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit' }).format(new Date(attempt.startedAt)),
      time: new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(new Date(attempt.startedAt)),
    }
  })
})
const chartPolyline = computed(() => chartPoints.value.map((point) => `${point.x},${point.y}`).join(' '))

async function loadStatistics() {
  loading.value = true
  errorMessage.value = ''

  try {
    await auth.init()
    if (!auth.user?.id) {
      await router.replace({ name: 'login', query: { redirect: '/estatisticas' } })
      return
    }
    attempts.value = await getUserQuizAttempts(auth.user.id)
  } catch (error) {
    errorMessage.value = error.message || t('error.history.loadFailed')
  } finally {
    loading.value = false
  }
}

function formatPoints(value) {
  return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value)
}

onMounted(loadStatistics)
</script>

<template>
  <div class="account-page-layout">
    <SideBar/>
    <section class="account-page-content">
      <header>
        <h1 class="font-display text-2xl font-semibold text-lagoon dark:text-cream-soft sm:text-3xl">{{ t('statistics.title') }}</h1>
        <p class="mt-2 text-lagoon/65 dark:text-cream-soft/65">{{ t('statistics.subtitle') }}</p>
      </header>

      <div v-if="loading" class="mt-8 rounded-xl2 bg-cream p-6 text-center text-lagoon/65 shadow-soft dark:bg-lagoon-light/40 dark:text-cream-soft/65 dark:shadow-softDark" role="status">
        {{ t('statistics.loading') }}
      </div>

      <div v-else-if="errorMessage" class="mt-8 rounded-xl2 border border-error/30 bg-error-bg p-6 text-center dark:bg-error-bgDark" role="alert">
        <p class="font-semibold text-error">{{ errorMessage }}</p>
        <BaseButton class="mt-4" @click="loadStatistics">{{ t('statistics.retry') }}</BaseButton>
      </div>

      <div v-else-if="attempts.length === 0" class="mt-8 rounded-blob bg-blush-soft px-6 py-10 text-center dark:bg-lagoon-light/40">
        <p class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('statistics.emptyTitle') }}</p>
        <p class="mt-2 text-sm text-lagoon/65 dark:text-cream-soft/65">{{ t('statistics.emptyBody') }}</p>
        <BaseButton class="mt-5" @click="router.push('/enviar')">{{ t('statistics.newQuiz') }}</BaseButton>
      </div>

      <template v-else>
        <section class="mt-7 grid gap-4 sm:grid-cols-2" :aria-label="t('statistics.overview')">
          <article class="rounded-xl2 bg-blush-soft p-5 shadow-soft dark:bg-lagoon-light/40 dark:shadow-softDark">
            <p class="text-sm font-semibold text-rosewood/80 dark:text-cream-soft/70">{{ t('statistics.totalPoints') }}</p>
            <p class="mt-2 font-display text-3xl font-bold text-lagoon dark:text-cream-soft">{{ formatPoints(totalPoints) }}<span class="text-xl font-medium text-lagoon/55 dark:text-cream-soft/55"> / {{ formatPoints(totalPossiblePoints) }}</span> <span class="text-base font-medium">{{ t('statistics.points') }}</span></p>
            <p class="mt-1 text-sm font-semibold text-lagoon/55 dark:text-cream-soft/55">{{ totalPointsPercentage }}% {{ t('statistics.pointsPercentage') }}</p>
          </article>
          <article class="rounded-xl2 bg-cream p-5 shadow-soft dark:bg-lagoon-light/40 dark:shadow-softDark">
            <p class="text-sm font-semibold text-lagoon/65 dark:text-cream-soft/65">{{ t('statistics.answeredPoints') }}</p>
            <p class="mt-2 font-display text-3xl font-bold text-lagoon dark:text-cream-soft">{{ formatPoints(answeredPoints) }}<span class="text-xl font-medium text-lagoon/55 dark:text-cream-soft/55"> / {{ formatPoints(answeredPossiblePoints) }}</span> <span class="text-base font-medium">{{ t('statistics.points') }}</span></p>
            <p class="mt-1 text-sm font-semibold text-lagoon/55 dark:text-cream-soft/55">{{ answeredPointsPercentage }}% {{ t('statistics.pointsPercentage') }}</p>
          </article>
        </section>

        <section class="mt-10">
          <h2 class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('statistics.pointsByDifficulty') }}</h2>
          <div class="mt-4 grid gap-4 sm:grid-cols-3">
            <article
              v-for="summary in pointsByDifficulty"
              :key="summary.level"
              class="rounded-xl2 p-5 shadow-soft dark:bg-lagoon-light/40 dark:shadow-softDark"
              :class="summary.level === 'medium' ? 'bg-cream' : 'bg-blush-soft'"
            >
              <h3 class="font-semibold text-lagoon dark:text-cream-soft">{{ t(`upload.difficulty.${summary.level}`) }}</h3>
              <p class="mt-3 font-display text-2xl font-bold text-lagoon dark:text-cream-soft">{{ formatPoints(summary.points) }}<span class="text-base font-medium text-lagoon/50 dark:text-cream-soft/50"> / {{ formatPoints(summary.possible) }} {{ t('statistics.points') }}</span></p>
              <p class="mt-1 text-sm font-semibold text-lagoon/55 dark:text-cream-soft/55">{{ summary.percentage }}% {{ t('statistics.pointsPercentage') }}</p>
              <p class="mt-1 text-sm text-lagoon/55 dark:text-cream-soft/55">{{ summary.quizzes }} {{ t('statistics.quizzes') }}</p>
            </article>
          </div>
        </section>

        <section class="mt-10">
          <h2 class="font-display text-lg font-semibold text-lagoon dark:text-cream-soft">{{ t('statistics.accuracyOverTime') }}</h2>
          <p class="mt-1 text-sm text-lagoon/60 dark:text-cream-soft/60">{{ t('statistics.chartDescription') }}</p>
          <div class="mt-4 overflow-x-auto rounded-xl2 bg-cream p-4 shadow-soft dark:bg-lagoon-light/40 dark:shadow-softDark">
            <svg
              class="max-w-none"
              :width="chartWidth"
              height="300"
              :viewBox="`0 0 ${chartWidth} 300`"
              role="img"
              :aria-label="t('statistics.chartDescription')"
            >
              <g v-for="percentage in [0, 25, 50, 75, 100]" :key="percentage">
                <line :x1="54" :x2="chartWidth - 24" :y1="236 - percentage * 2.12" :y2="236 - percentage * 2.12" class="stroke-lagoon/10 dark:stroke-cream-soft/10" />
                <text x="46" :y="240 - percentage * 2.12" text-anchor="end" class="fill-lagoon/55 text-[11px] dark:fill-cream-soft/55">{{ percentage }}%</text>
              </g>
              <polyline
                v-if="chartPoints.length > 1"
                :points="chartPolyline"
                fill="none"
                class="stroke-rosewood"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <g v-for="point in chartPoints" :key="point.attempt.id">
                <circle :cx="point.x" :cy="point.y" r="5" :class="[point.color, 'stroke-cream']" stroke-width="2">
                  <title>{{ point.attempt.title || point.label }} · {{ Math.round(point.accuracy) }}%</title>
                </circle>
                <text :x="point.x" y="260" text-anchor="middle" class="fill-lagoon/65 text-[11px] dark:fill-cream-soft/65">{{ point.label }}</text>
                <text :x="point.x" y="277" text-anchor="middle" class="fill-lagoon/50 text-[10px] dark:fill-cream-soft/50">{{ point.time }}</text>
                <text :x="point.x" :y="point.y - 11" text-anchor="middle" class="fill-lagoon/55 text-[11px] font-semibold dark:fill-cream-soft/55">{{ Math.round(point.accuracy) }}%</text>
              </g>
            </svg>
            <p class="mt-2 text-center text-xs text-lagoon/55 dark:text-cream-soft/55">{{ t('statistics.chartXAxis') }}</p>
          </div>
        </section>
      </template>
    </section>
  </div>
</template>
