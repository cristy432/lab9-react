import { createContext, useContext, useReducer, useEffect } from 'react'

const QuizContext = createContext()

const initialState = {
  phase: 'start',
  username: '',
  questions: [],
  currentIndex: 0,
  answers: [],
  streak: 0,
  maxStreak: 0,
  config: null,
}

function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ':
      return {
        ...state,
        phase: 'quiz',
        username: action.payload.username,
        questions: action.payload.questions,
        config: action.payload.config,
        currentIndex: 0,
        answers: [],
        streak: 0,
        maxStreak: 0,
      }

    case 'ANSWER_QUESTION': {
      const { answer, isCorrect } = action.payload
      const newStreak = isCorrect ? state.streak + 1 : 0
      const newMaxStreak = Math.max(state.maxStreak, newStreak)
      const newAnswers = [...state.answers, { answer, isCorrect, questionIndex: state.currentIndex }]
      const isLast = state.currentIndex >= state.questions.length - 1

      return {
        ...state,
        answers: newAnswers,
        streak: newStreak,
        maxStreak: newMaxStreak,
        currentIndex: isLast ? state.currentIndex : state.currentIndex + 1,
        phase: isLast ? 'results' : 'quiz',
      }
    }

    case 'RESET':
      return { ...initialState }

    default:
      return state
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState, (init) => {
    try {
      const saved = localStorage.getItem('quiz_session')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.phase === 'quiz') return parsed
      }
    } catch (e) {}
    return init
  })

  useEffect(() => {
    if (state.phase === 'quiz') {
      localStorage.setItem('quiz_session', JSON.stringify(state))
    } else {
      localStorage.removeItem('quiz_session')
    }
  }, [state])

  return (
    <QuizContext.Provider value={{ state, dispatch }}>
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  return useContext(QuizContext)
}
