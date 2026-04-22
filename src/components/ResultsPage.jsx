import { useMemo, useState, useCallback } from 'react'
import { useQuiz } from '../context/QuizContext'
import { useTheme } from '../context/ThemeContext'
import { useLocalStorage } from '../hooks/useLocalStorage'

export default function ResultsPage() {
  const { state, dispatch } = useQuiz()
  const { dark, toggle } = useTheme()
  const { questions, answers, username, maxStreak } = state

  const [scores, setScores] = useLocalStorage('quiz_scores', [])
  const [filter, setFilter] = useState('toate')
  const [catFilter, setCatFilter] = useState('toate')
  const [scoreSaved, setScoreSaved] = useState(false)

  const correct = useMemo(() => answers.filter(a => a.isCorrect).length, [answers])
  const percent = useMemo(() => Math.round((correct / questions.length) * 100), [correct, questions.length])

  const categoryStats = useMemo(() => {
    const cats = {}
    questions.forEach((q, i) => {
      if (!cats[q.category]) cats[q.category] = { total: 0, correct: 0 }
      cats[q.category].total++
      if (answers[i]?.isCorrect) cats[q.category].correct++
    })
    return cats
  }, [questions, answers])

  const filteredAnswers = useMemo(() => {
    return questions.map((q, i) => ({ q, a: answers[i] })).filter(({ q, a }) => {
      if (filter === 'corecte' && !a?.isCorrect) return false
      if (filter === 'gresite' && a?.isCorrect) return false
      if (catFilter !== 'toate' && q.category !== catFilter) return false
      return true
    })
  }, [questions, answers, filter, catFilter])

  const sortedScores = useMemo(() => {
    return [...scores].sort((a, b) => b.percent - a.percent || b.correct - a.correct)
  }, [scores])

  const categories = useMemo(() => ['toate', ...Object.keys(categoryStats)], [categoryStats])

  const handleSaveScore = useCallback(() => {
    if (scoreSaved) return
    const newScore = {
      username,
      correct,
      total: questions.length,
      percent,
      maxStreak,
      date: new Date().toLocaleDateString('ro-RO'),
    }
    setScores([...scores, newScore])
    setScoreSaved(true)
  }, [scoreSaved, username, correct, questions.length, percent, maxStreak, scores, setScores])

  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [dispatch])

  return (
    <div className="results-page">
      <div className="header-bar">
        <h2>Rezultate</h2>
        <button className="theme-btn" onClick={toggle}>{dark ? '☀️' : '🌙'}</button>
      </div>

      <div className="score-card">
        <div className="score-big">{correct}/{questions.length}</div>
        <div className="score-percent">{percent}%</div>
        <div className="score-streak">🔥 Streak maxim: {maxStreak}</div>
        <p className="score-username">{username}</p>
      </div>

      <div className="cat-stats">
        {Object.entries(categoryStats).map(([cat, s]) => (
          <div key={cat} className="cat-stat-item">
            <span>{cat}</span>
            <span>{s.correct}/{s.total}</span>
          </div>
        ))}
      </div>

      <div className="review-section">
        <h3>Revizuire răspunsuri</h3>
        <div className="filter-bar">
          <div className="tab-group">
            {['toate', 'corecte', 'gresite'].map(f => (
              <button
                key={f}
                className={`tab-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)} className="cat-select">
            {categories.map(c => (
              <option key={c} value={c}>{c === 'toate' ? 'Toate categoriile' : c}</option>
            ))}
          </select>
        </div>

        <div className="answer-cards">
          {filteredAnswers.map(({ q, a }, i) => (
            <div key={i} className={`answer-card ${a?.isCorrect ? 'card-correct' : 'card-wrong'}`}>
              <p className="card-question">{q.question}</p>
              <p className="card-answer">
                Răspunsul tău: <strong>{a?.answer || 'Expirat'}</strong>
              </p>
              {!a?.isCorrect && (
                <p className="card-correct-ans">Corect: <strong>{q.correct}</strong></p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="history-section">
        <h3>Istoric scoruri</h3>
        {!scoreSaved && (
          <button className="save-btn" onClick={handleSaveScore}>Salvează scorul</button>
        )}
        <table className="scores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Utilizator</th>
              <th>Scor</th>
              <th>%</th>
              <th>Streak</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {sortedScores.map((s, i) => (
              <tr key={i} className={s.username === username ? 'current-user' : ''}>
                <td>{i + 1}</td>
                <td>{s.username}</td>
                <td>{s.correct}/{s.total}</td>
                <td>{s.percent}%</td>
                <td>🔥{s.maxStreak}</td>
                <td>{s.date}</td>
              </tr>
            ))}
            {sortedScores.length === 0 && (
              <tr><td colSpan="6" style={{ textAlign: 'center' }}>Niciun scor salvat</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <button className="start-btn retry-btn" onClick={handleReset}>
        Încearcă din nou
      </button>
    </div>
  )
}
