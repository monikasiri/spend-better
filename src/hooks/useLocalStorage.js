import { useState, useEffect } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      if (stored === null) {
        return typeof initialValue === 'function' ? initialValue() : initialValue
      }
      return JSON.parse(stored)
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue
    }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch (e) { console.error('Failed to save', key, e) }
  }, [key, value])

  return [value, setValue]
}
