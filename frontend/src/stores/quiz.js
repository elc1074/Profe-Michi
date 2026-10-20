import { defineStore } from 'pinia'
import { evaluateQuiz as requestEvaluation, generateQuiz as requestQuiz } from '../services/quizWebhook'

function initialRecordings(questions) {
  const map = {}
  questions.forEach((q) => {
    map[q.id] = { status: 'idle', elapsed: 0, timing: false, mode: 'text', textAnswer: '', transcript: '' }
  })
  return map
}

export const useQuizStore = defineStore('quiz', {
  state: () => ({
    file: null,
    chapter: '',
    questionCount: 5,
    difficulty: 'easy',
    minQuestionCount: 5,
    maxQuestionCount: 15,

    generating: false,
    generated: false,

    questions: [],
    recordings: {},
    currentIndex: 0,

    grading: false,
    result: null,

    showUnansweredDialog: false,
    simulateError: false,
  }),
  getters: {
    hasFile: (state) => !!state.file,
    currentQuestion: (state) => state.questions[state.currentIndex],
    totalQuestions: (state) => state.questions.length,
    answeredCount: (state) =>
      Object.values(state.recordings).filter((recording) => {
        const answer = recording.mode === 'text' ? recording.textAnswer : recording.transcript
        return answer?.trim()
      }).length,
    unansweredIds: (state) =>
      state.questions
        .filter((q) => {
          const recording = state.recordings[q.id]
          const answer = recording?.mode === 'text' ? recording.textAnswer : recording?.transcript
          return !answer?.trim()
        })
        .map((q) => q.id),
    progressPercent: (state) => {
      const answered = Object.values(state.recordings).filter((recording) => {
        const answer = recording.mode === 'text' ? recording.textAnswer : recording.transcript
        return answer?.trim()
      }).length
      return Math.round((answered / state.questions.length) * 100)
    },
  },
  actions: {
    setFile(file) {
      this.file = file
    },
    setQuestionCount(count) {
      const parsedCount = Number(count)
      this.questionCount = Math.min(this.maxQuestionCount, Math.max(this.minQuestionCount, parsedCount || this.minQuestionCount))
    },
    setDifficulty(difficulty) {
      if (['easy', 'medium', 'hard'].includes(difficulty)) this.difficulty = difficulty
    },
    removeFile() {
      this.file = null
    },
    async generateQuiz() {
      this.generating = true
      this.generated = false
      this.result = null

      try {
        const generatedQuiz = await requestQuiz(this.file, {
          questionCount: this.questionCount,
          difficulty: this.difficulty,
        })
        this.chapter = generatedQuiz.chapter
        this.questionCount = generatedQuiz.questionCount
        this.questions = generatedQuiz.questions
        this.recordings = initialRecordings(this.questions)
        this.currentIndex = 0
        this.generated = true
      } finally {
        this.generating = false
      }
    },
    goTo(index) {
      if (index >= 0 && index < this.questions.length) {
        this.currentIndex = index
      }
    },
    next() {
      if (this.currentIndex < this.questions.length - 1) this.goTo(this.currentIndex + 1)
    },
    prev() {
      if (this.currentIndex > 0) this.goTo(this.currentIndex - 1)
    },
    tickCurrent() {
      const q = this.currentQuestion
      const recording = q ? this.recordings[q.id] : null
      if (!recording || (recording.status !== 'recording' && !recording.timing)) return
      this.recordings[q.id].elapsed++
    },
    startTextTiming(id) {
      const recording = this.recordings[id]
      if (!recording) return
      recording.timing = true
    },
    setResponseMode(id, mode) {
      if (mode !== 'text' && mode !== 'audio') return
      if (this.recordings[id]?.status === 'recording') return
      this.recordings[id].mode = mode
    },
    startRecording(id) {
      this.recordings[id].mode = 'audio'
      this.recordings[id].timing = true
      this.recordings[id].status = 'recording'
    },
    stopRecording(id, recording) {
      this.recordings[id] = {
        ...this.recordings[id],
        ...recording,
        status: 'recorded',
        mode: 'audio',
        timing: true,
        elapsed: this.recordings[id].elapsed,
      }
    },
    updateTranscript(id, transcript) {
      if (this.recordings[id]?.status !== 'recorded') return
      const recording = this.recordings[id]
      recording.transcript = transcript
      if (recording.mode === 'text') recording.textAnswer = transcript
    },
    submitTextAnswer(id, transcript) {
      this.recordings[id] = {
        ...this.recordings[id],
        status: 'recorded',
        elapsed: this.recordings[id]?.elapsed ?? 0,
        mode: 'text',
        timing: this.recordings[id]?.timing ?? false,
        textAnswer: transcript,
        transcript,
      }
    },
    deleteRecording(id) {
      if (this.recordings[id]?.audioUrl) URL.revokeObjectURL(this.recordings[id].audioUrl)
      this.recordings[id] = {
        ...this.recordings[id],
        status: 'idle',
        mode: 'text',
        textAnswer: '',
        transcript: '',
        audioUrl: undefined,
        blob: undefined,
      }
    },
    async submitForGrading() {
      this.grading = true
      try {
        const evaluation = await requestEvaluation({
          chapter: this.chapter,
          questions: this.questions,
        }, this.recordings)
        const answersByQuestionId = new Map(
          evaluation.answers.map((answer) => [String(answer.questionId), answer]),
        )
        const questions = this.questions.map((question) => {
          const answer = answersByQuestionId.get(String(question.id))
          const recording = this.recordings[question.id]
          const studentAnswer = (
            recording?.mode === 'text' ? recording.textAnswer : recording?.transcript
          )?.trim() ?? ''
          const score = answer?.score ?? 0

          return {
            ...question,
            status: !studentAnswer ? 'unanswered' : score >= 6 ? 'correct' : 'incorrect',
            score,
            maxScore: answer?.maxScore ?? 10,
            durationSeconds: recording?.elapsed ?? 0,
            studentAnswerLabel: studentAnswer || 'Sem resposta',
            classification: answer?.classification ?? '',
            mainError: answer?.mainError ?? '',
            expectedAnswer: answer?.expectedAnswer ?? '',
            feedback: answer?.feedback ?? '',
          }
        })
        const calculatedScore = questions.reduce((total, question) => total + question.score, 0)
        const calculatedMax = questions.reduce((total, question) => total + question.maxScore, 0)

        this.questions = questions
        this.result = {
          questions,
          totalScore: Number.isFinite(evaluation.overallScore) ? evaluation.overallScore : calculatedScore,
          maxScore: calculatedMax,
          summary: evaluation.summary,
        }
      } finally {
        this.grading = false
      }
    },
    resetQuiz() {
      this.file = null
      this.chapter = ''
      this.questionCount = this.minQuestionCount
      this.difficulty = 'easy'
      this.generating = false
      this.generated = false
      this.questions = []
      this.currentIndex = 0
      this.recordings = {}
      this.grading = false
      this.result = null
      this.showUnansweredDialog = false
    },
  },
})
