import { useState, useMemo, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'
import { useTheme } from '../context/ThemeContext'
import allQuestions from '../data/questions.json'

const CATEGORIES = ['Toate', 'Fotbal', 'Baschet', 'Tenis']
const TIME_OPTIONS = [
  { label: 'Nelimitat', value: null },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
]

export default function StartPage() {
  const { dispatch } = useQuiz()
  const { dark, toggle } = useTheme()
  const [username, setUsername] = useState('')
  const [category, setCategory] = useState('Toate')
  const [numQuestions, setNumQuestions] = useState(10)
  const [timeLimit, setTimeLimit] = useState(null)
  const [error, setError] = useState('')

  const availableQuestions = useMemo(() => {
    if (category === 'Toate') return allQuestions
    return allQuestions.filter(q => q.category === category)
  }, [category])

  const questionCountOptions = useMemo(() => {
    const counts = [5, 10, 15, 20]
    const available = availableQuestions.length
    const opts = counts.filter(c => c <= available)
    opts.push(available)
    return [...new Set(opts)]
  }, [availableQuestions])

  const handleCategoryChange = useCallback((cat) => {
    setCategory(cat)
    setNumQuestions(5)
  }, [])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!username.trim()) {
      setError('Introdu un nume de utilizator!')
      return
    }

    const pool = [...availableQuestions].sort(() => Math.random() - 0.5).slice(0, numQuestions)

    dispatch({
      type: 'START_QUIZ',
      payload: {
        username: username.trim(),
        questions: pool,
        config: { category, numQuestions, timeLimit },
      },
    })
  }, [username, availableQuestions, numQuestions, category, timeLimit, dispatch])

  return (
    <div className="start-page">
      <div className="header-bar">
        <h1>🏅 Sport Quiz</h1>
        <button className="theme-btn" onClick={toggle}>
          {dark ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="start-form">
        <div className="form-group">
          <label>Numele tău</label>
          <input
            type="text"
            placeholder="ex: Cristi"
            value={username}
            onChange={e => {
              setUsername(e.target.value)
              setError('')
            }}
            className={error ? 'input-error' : ''}
          />
          {error && <span className="error-msg">{error}</span>}
        </div>

        <div className="form-group">
          <label>Categorie</label>
          <div className="option-group">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                className={`option-btn ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Număr de întrebări ({availableQuestions.length} disponibile)</label>
          <div className="option-group">
            {questionCountOptions.map(n => (
              <button
                key={n}
                type="button"
                className={`option-btn ${numQuestions === n ? 'active' : ''}`}
                onClick={() => setNumQuestions(n)}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Timp per întrebare</label>
          <div className="option-group">
            {TIME_OPTIONS.map(opt => (
              <button
                key={opt.label}
                type="button"
                className={`option-btn ${timeLimit === opt.value ? 'active' : ''}`}
                onClick={() => setTimeLimit(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" className="start-btn">Începe Quizul</button>
      </form>
    </div>
  )
}
