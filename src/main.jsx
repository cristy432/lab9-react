import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { QuizProvider } from './context/QuizContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <QuizProvider>
        <App />
      </QuizProvider>
    </ThemeProvider>
  </React.StrictMode>
)
