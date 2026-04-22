import { useQuiz } from './context/QuizContext'
import StartPage from './components/StartPage'
import QuizPage from './components/QuizPage'
import ResultsPage from './components/ResultsPage'

function App() {
  const { state } = useQuiz()

  if (state.phase === 'quiz') return <QuizPage />
  if (state.phase === 'results') return <ResultsPage />
  return <StartPage />
}

export default App
