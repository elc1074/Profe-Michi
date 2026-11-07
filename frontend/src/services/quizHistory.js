import i18n from '@/i18n'
import { supabase, isSupabaseConfigured } from '@/services/supabase'

export function buildQuizTitle(source, savedAt = new Date(), locale = 'pt-BR') {
  const fileName = source?.trim() || 'Quiz'
  const dateTime = new Intl.DateTimeFormat(locale, {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(savedAt)

  return `${fileName} — ${dateTime}`
}

const ATTEMPT_SELECT = `
  id,
  started_at,
  finished_at,
  score,
  total_questions,
  correct_answers,
  quizzes (
    id,
    title,
    topic,
    difficulty,
    created_at,
    questions (
      id,
      question_order,
      question_text,
      correct_answer
    )
  ),
  answers (
    question_id,
    answer_text,
    transcription,
    is_correct,
    evaluation
  )
`

function normalizeEvaluation(value) {
  if (typeof value !== 'string') return value ?? {}

  try {
    return JSON.parse(value)
  } catch {
    return {}
  }
}

function normalizeAttempt(attempt) {
  const quiz = attempt.quizzes ?? {}
  const answersByQuestionId = new Map(
    (attempt.answers ?? []).map((answer) => [answer.question_id, answer]),
  )
  const questions = (quiz.questions ?? [])
    .slice()
    .sort((left, right) => left.question_order - right.question_order)
    .map((question) => {
      const answer = answersByQuestionId.get(question.id)
      const evaluation = normalizeEvaluation(answer?.evaluation)
      const studentAnswer = (answer?.answer_text || answer?.transcription || '').trim()
      const score = Number(evaluation.score) || 0
      const status = !studentAnswer.trim()
        ? 'unanswered'
        : typeof answer?.is_correct === 'boolean'
          ? answer.is_correct ? 'correct' : 'incorrect'
          : score >= 6 ? 'correct' : 'incorrect'

      return {
        id: question.id,
        prompt: question.question_text,
        status,
        score,
        maxScore: Number(evaluation.max_score ?? evaluation.maxScore) || 10,
        durationSeconds: Number(evaluation.durationSeconds ?? evaluation.duration_seconds) || 0,
        studentAnswerLabel: studentAnswer,
        expectedAnswer: evaluation.expectedAnswer ?? evaluation.expected_answer ?? question.correct_answer ?? '',
        mainError: evaluation.mainError ?? evaluation.main_error ?? '',
        feedback: evaluation.feedback ?? '',
      }
    })

  const calculatedScore = questions.reduce((total, question) => total + question.score, 0)
  const maxScore = questions.reduce((total, question) => total + question.maxScore, 0)

  return {
    id: attempt.id,
    quizId: quiz.id,
    title: quiz.title?.trim() ?? '',
    topic: quiz.topic ?? '',
    difficulty: quiz.difficulty ?? '',
    createdAt: quiz.created_at,
    startedAt: attempt.started_at,
    finishedAt: attempt.finished_at,
    totalScore: Number(attempt.score ?? calculatedScore),
    maxScore,
    totalQuestions: Number(attempt.total_questions ?? questions.length),
    correctAnswers: Number(attempt.correct_answers ?? questions.filter((question) => question.status === 'correct').length),
    questions,
  }
}

export async function getUserQuizAttempts(userId) {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.global.t('error.history.notConfigured'))
  }

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(ATTEMPT_SELECT)
    .eq('user_id', userId)
    .order('started_at', { ascending: false })

  if (error) {
    console.error('Failed to load quiz attempts', error)
    throw new Error(i18n.global.t('error.history.loadFailed'))
  }

  return (data ?? []).map(normalizeAttempt)
}

export async function getUserQuizAttempt(userId, attemptId) {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.global.t('error.history.notConfigured'))
  }

  const { data, error } = await supabase
    .from('quiz_attempts')
    .select(ATTEMPT_SELECT)
    .eq('user_id', userId)
    .eq('id', attemptId)
    .maybeSingle()

  if (error) {
    console.error('Failed to load saved quiz attempt', error)
    throw new Error(i18n.global.t('error.history.loadFailed'))
  }

  return data ? normalizeAttempt(data) : null
}

export async function saveQuizAttempt({
  userId,
  source,
  topic,
  difficulty,
  questions,
  recordings,
  result,
}) {
  if (!isSupabaseConfigured) {
    throw new Error(i18n.global.t('error.history.notConfigured'))
  }

  let quizId
  let attemptId
  const locale = i18n.global.locale.value ?? i18n.global.locale ?? 'pt-BR'
  const generatedTitle = buildQuizTitle(source, new Date(), locale)

  try {
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        created_by: userId,
        title: generatedTitle,
        source: source || null,
        topic: topic || null,
        difficulty,
      })
      .select('id')
      .single()

    if (quizError) throw quizError
    quizId = quiz.id

    const { data: savedQuestions, error: questionsError } = await supabase
      .from('questions')
      .insert(questions.map((question, index) => ({
        quiz_id: quizId,
        question_order: index + 1,
        question_text: question.prompt,
        correct_answer: question.expectedAnswer || null,
      })))
      .select('id, question_order')

    if (questionsError) throw questionsError

    const correctAnswers = result.questions.filter((question) => question.status === 'correct').length
    const { data: attempt, error: attemptError } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: userId,
        quiz_id: quizId,
        score: result.totalScore,
        total_questions: result.questions.length,
        correct_answers: correctAnswers,
      })
      .select('id')
      .single()

    if (attemptError) throw attemptError
    attemptId = attempt.id

    const answers = result.questions.map((question, index) => {
      const recording = recordings[questions[index].id]
      const response = recording?.mode === 'text'
        ? recording.textAnswer
        : recording?.transcript

      return {
        attempt_id: attemptId,
        question_id: savedQuestions.find((saved) => saved.question_order === index + 1).id,
        answer_text: recording?.mode === 'text' ? response || null : null,
        transcription: recording?.mode === 'audio' ? response || null : null,
        is_correct: question.status === 'unanswered' ? null : question.status === 'correct',
        evaluation: {
          score: question.score,
          max_score: question.maxScore,
          classification: question.classification,
          expectedAnswer: question.expectedAnswer,
          mainError: question.mainError,
          feedback: question.feedback,
          durationSeconds: question.durationSeconds,
        },
      }
    })
    const { error: answersError } = await supabase.from('answers').insert(answers)
    if (answersError) throw answersError

    return attemptId
  } catch (error) {
    console.error('Failed to save quiz attempt', error)
    if (attemptId) {
      const { error: cleanupError } = await supabase.from('quiz_attempts').delete().eq('id', attemptId)
      if (cleanupError) console.error('Failed to clean up incomplete quiz attempt', cleanupError)
    }
    if (quizId) {
      const { error: cleanupError } = await supabase.from('quizzes').delete().eq('id', quizId)
      if (cleanupError) console.error('Failed to clean up incomplete quiz', cleanupError)
    }
    throw new Error(i18n.global.t('error.history.saveFailed'))
  }
}
