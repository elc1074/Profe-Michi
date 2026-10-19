<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useQuizStore } from '../stores/quiz'
import BaseButton from '../components/BaseButton.vue'
import AudioRecorder from '../components/AudioRecorder.vue'
import QuestionIndex from '../components/QuestionIndex.vue'
import UnansweredDialog from '../components/UnansweredDialog.vue'

const { t } = useI18n()
const router = useRouter()
const quiz = useQuizStore()
const audioPreparing = ref(false)

let ticker = null

onMounted(() => {
  if (!quiz.generated) {
    router.replace(quiz.hasFile ? '/gerando' : '/enviar')
    return
  }
  ticker = setInterval(() => quiz.tickCurrent(), 1000)
})
onBeforeUnmount(() => clearInterval(ticker))

<<<<<<< HEAD
const currentRecording = computed(() => quiz.recordings[quiz.currentQuestion?.id])
const responseMode = computed(() => currentRecording.value.mode)
=======
const activeQuestion = computed(() => quiz.currentQuestion)
const currentRecording = computed(() => quiz.recordings[activeQuestion.value?.id] ?? { status: 'idle', elapsed: 0 })
const isRecording = computed(() => Object.values(quiz.recordings).some((recording) => recording.status === 'recording'))
>>>>>>> main

function formatTime(sec) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function handleSubmitClick() {
  if (quiz.unansweredIds.length > 0) {
    quiz.showUnansweredDialog = true
  } else {
    proceedToGrading()
  }
}

function proceedToGrading() {
  quiz.showUnansweredDialog = false
  router.push('/corrigindo')
}

function reviewFirstUnanswered() {
  quiz.showUnansweredDialog = false
  const idx = quiz.questions.findIndex((q) => q.id === quiz.unansweredIds[0])
  if (idx >= 0) quiz.goTo(idx)
}
</script>

<template>
  <div v-if="activeQuestion" class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
    <QuestionIndex
      :questions="quiz.questions"
      :recordings="quiz.recordings"
      :current-index="quiz.currentIndex"
      @select="quiz.goTo($event)"
    />

    <section :key="activeQuestion.id">
      <div class="mt-6 flex items-center justify-between text-sm text-lagoon/55 dark:text-cream-soft/55">
        <span>{{ t('quiz.questionLabel', { current: quiz.currentIndex + 1, total: quiz.totalQuestions }) }}</span>
        <span class="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" /><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
          {{ t('quiz.timer') }}: {{ formatTime(currentRecording.elapsed) }}
        </span>
      </div>

      <h1 class="mt-3 text-xl font-semibold leading-snug text-lagoon dark:text-cream-soft sm:text-2xl">
        {{ activeQuestion.prompt }}
      </h1>

<<<<<<< HEAD
    <div class="mt-6">
      <div class="mb-3 grid grid-cols-2 rounded-xl bg-lagoon/5 p-1 dark:bg-cream-soft/5" role="tablist" :aria-label="t('quiz.responseMode.label')">
        <button
          type="button"
          role="tab"
          :aria-selected="responseMode === 'text'"
          :disabled="audioPreparing || currentRecording.status === 'recording'"
          class="rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          :class="responseMode === 'text' ? 'bg-cream-soft text-lagoon shadow-soft dark:bg-lagoon-light dark:text-cream-soft' : 'text-lagoon/60 hover:text-lagoon dark:text-cream-soft/60 dark:hover:text-cream-soft'"
          @click="quiz.setResponseMode(quiz.currentQuestion.id, 'text')"
        >
          {{ t('quiz.responseMode.text') }}
        </button>
        <button
          type="button"
          role="tab"
          :aria-selected="responseMode === 'audio'"
          :disabled="audioPreparing || currentRecording.status === 'recording'"
          class="rounded-lg px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50"
          :class="responseMode === 'audio' ? 'bg-cream-soft text-lagoon shadow-soft dark:bg-lagoon-light dark:text-cream-soft' : 'text-lagoon/60 hover:text-lagoon dark:text-cream-soft/60 dark:hover:text-cream-soft'"
          @click="quiz.setResponseMode(quiz.currentQuestion.id, 'audio')"
        >
          {{ t('quiz.responseMode.audio') }}
        </button>
      </div>

      <div v-if="responseMode === 'text'" role="tabpanel">
        <label :for="`text-answer-${quiz.currentQuestion.id}`" class="mb-2 block text-sm font-semibold text-lagoon dark:text-cream-soft">
          {{ t('quiz.responseMode.textLabel') }}
        </label>
        <textarea
          :id="`text-answer-${quiz.currentQuestion.id}`"
          :value="currentRecording.textAnswer"
          rows="6"
          spellcheck="true"
          :placeholder="t('quiz.responseMode.textPlaceholder')"
          class="w-full resize-y rounded-xl2 border border-lagoon/15 bg-cream-soft p-4 text-sm text-lagoon outline-none transition focus:border-rosewood dark:border-cream-soft/20 dark:bg-lagoon-light/40 dark:text-cream-soft"
          @input="quiz.updateTextAnswer(quiz.currentQuestion.id, $event.target.value)"
        />
      </div>
      <div v-else role="tabpanel">
        <AudioRecorder
          :status="currentRecording.status"
          :question-id="quiz.currentQuestion.id"
          :audio-url="currentRecording.audioUrl"
          :transcript="currentRecording.transcript"
          @busy="audioPreparing = $event"
          @start="quiz.startRecording(quiz.currentQuestion.id)"
          @stop="quiz.stopRecording(quiz.currentQuestion.id, $event)"
          @delete="quiz.deleteRecording(quiz.currentQuestion.id)"
          @update-transcript="quiz.updateTranscript(quiz.currentQuestion.id, $event)"
        />
      </div>
    </div>
=======
      <div class="mt-6">
        <AudioRecorder
          :status="currentRecording.status"
          :question-id="activeQuestion.id"
          :audio-url="currentRecording.audioUrl"
          :transcript="currentRecording.transcript"
          @start="quiz.startRecording(activeQuestion.id)"
          @stop="quiz.stopRecording(activeQuestion.id, $event)"
          @delete="quiz.deleteRecording(activeQuestion.id)"
          @update-transcript="quiz.updateTranscript(activeQuestion.id, $event)"
          @submit-text="quiz.submitTextAnswer(activeQuestion.id, $event)"
        />
      </div>
    </section>
>>>>>>> main

    <div class="mt-8 flex items-center justify-between gap-3">
      <BaseButton variant="ghost" :disabled="quiz.currentIndex === 0 || isRecording" @click="quiz.prev()">
        {{ t('quiz.prev') }}
      </BaseButton>
      <BaseButton
        v-if="quiz.currentIndex < quiz.totalQuestions - 1"
        variant="secondary"
        :disabled="isRecording"
        @click="quiz.next()"
      >
        {{ t('quiz.next') }}
      </BaseButton>
      <BaseButton v-else variant="primary" :disabled="isRecording" @click="handleSubmitClick">
        {{ t('quiz.submit') }}
      </BaseButton>
    </div>

    <UnansweredDialog
      v-if="quiz.showUnansweredDialog"
      :count="quiz.unansweredIds.length"
      @review="reviewFirstUnanswered"
      @submit-anyway="proceedToGrading"
    />
  </div>
</template>
