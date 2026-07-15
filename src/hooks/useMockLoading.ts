import { useEffect, useState } from 'react'

export function useMockLoading(durationMs = 250) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false)
    }, durationMs)

    return () => window.clearTimeout(timeoutId)
  }, [durationMs])

  return isLoading
}
