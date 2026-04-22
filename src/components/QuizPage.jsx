import { useState, useCallback, useEffect, memo } from 'react'
import { useQuiz } from '../context/QuizContext'
import { useTheme } from '../context/ThemeContext'
import { useTimer } from '../hooks/useTimer'

const AnswerBtn = memo(({ option, selected, correct, onClick, disabled }) => {
  let cls = 'answer-btn'
  if (selected === option) cls += correct ? ' correct' : ' wrong'
  else if (selected && option === correct) cls += ' correct'

  return (
    <button className={cls} onClick={() => onClick(option)} disabled={disabled}>
      {option}
    </button>
  )
})

export default function QuizPage() {
  const { state, dispatch } = useQuiz()
  const { dark, toggle } = useTheme()
  const { questions, currentIndex, streak, config } = state

  const question = questions[currentIndex]
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  const handleExpire = useCallback(() => {
    if (!answered) {
      setAnswered(true)
      setTimeout(() => {
        dispatch({ type: 'ANSWER_QUESTION', payload: { answer: null, isCorrect: false } })
        setSelected(null)
        setAnswered(false)
      }, 800)
    }
  }, [answered, dispatch])

  // key=currentIndex forțează resetul timerului la fiecare întrebare nouă
  const timeLeft = useTimer(config.timeLimit, handleExpire, currentIndex)

  useEffect(() => {
    setSelected(null)
    setAnswered(false)
  }, [currentIndex])

  const handleAnswer = useCallback((option) => {
    if (answered) return
    const isCorrect = option === question.correct
    setSelected(option)
    setAnswered(true)

    setTimeout(() => {
      dispatch({ type: 'ANSWER_QUESTION', payload: { answer: option, isCorrect } })
      setSelected(null)
      setAnswered(false)
    }, 800)
  }, [answered, question, dispatch])

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <span className="progress-text">
          Întrebarea {currentIndex + 1} / {questions.length}
        </span>
        <div className="meta-tags">
          <span className="tag category-tag">{question.category}</span>
          <span className={`tag diff-tag diff-${question.difficulty}`}>{question.difficulty}</span>
        </div>
        <button className="theme-btn" onClick={toggle}>{dark ? '☀️' : '🌙'}</button>
      </div>

      {config.timeLimit && (
        <div className="timer-display" style={{ color: timeLeft <= 5 ? '#e74c3c' : 'inherit' }}>
          ⏱ {timeLeft}s
        </div>
      )}

      {streak >= 2 && (
        <div className="streak-banner">🔥 Streak: {streak}</div>
      )}

      <div className="question-card">
        <p className="question-text">{question.question}</p>
      </div>

      <div className="answers-grid">
        {question.options.map(opt => (
          <AnswerBtn
            key={opt}
            option={opt}
            selected={selected}
            correct={question.correct}
            onClick={handleAnswer}
            disabled={answered}
          />
        ))}
      </div>

      <p className="progress-bottom">{currentIndex + 1} / {questions.length}</p>
    </div>
  )
}
