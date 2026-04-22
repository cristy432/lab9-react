import { useState, useCallback } from 'react'

export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const set = useCallback((newVal) => {
    setValue(newVal)
    localStorage.setItem(key, JSON.stringify(newVal))
  }, [key])

  return [value, set]
}
