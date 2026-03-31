import { useState, useCallback } from 'react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const DEFAULT_REACTION = {
  advice: null,
  sentiment: 'neutral',
  tree_reaction: '#48D1CC',
}

export function useMentor() {
  const [response, setResponse] = useState(DEFAULT_REACTION)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const askMentor = useCallback(async (message) => {
    if (!message.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`${API_BASE}/mentor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) {
        const detail = await res.json().catch(() => ({}))
        throw new Error(detail?.detail || `Server error ${res.status}`)
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err.message || 'The tree is silent. Please try again.')
      // Keep last good reaction color on error
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { response, isLoading, error, askMentor }
}
