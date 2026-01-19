import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to sync state with URL query parameters
 */
export function useUrlState<T extends string>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const getInitialValue = (): T => {
    if (typeof window === 'undefined') return defaultValue
    const params = new URLSearchParams(window.location.search)
    const value = params.get(key)
    return (value as T) || defaultValue
  }

  const [value, setValue] = useState<T>(getInitialValue)

  const setValueAndUrl = useCallback((newValue: T) => {
    setValue(newValue)

    const params = new URLSearchParams(window.location.search)
    if (newValue === defaultValue || newValue === '' || newValue === 'all') {
      params.delete(key)
    } else {
      params.set(key, newValue)
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [key, defaultValue])

  // Listen for popstate events (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlValue = params.get(key)
      setValue((urlValue as T) || defaultValue)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [key, defaultValue])

  return [value, setValueAndUrl]
}

/**
 * Hook to sync boolean state with URL query parameters
 */
export function useUrlBooleanState(
  key: string,
  defaultValue: boolean = false
): [boolean, (value: boolean) => void] {
  const getInitialValue = (): boolean => {
    if (typeof window === 'undefined') return defaultValue
    const params = new URLSearchParams(window.location.search)
    const value = params.get(key)
    if (value === null) return defaultValue
    return value === 'true' || value === '1'
  }

  const [value, setValue] = useState<boolean>(getInitialValue)

  const setValueAndUrl = useCallback((newValue: boolean) => {
    setValue(newValue)

    const params = new URLSearchParams(window.location.search)
    if (newValue === defaultValue) {
      params.delete(key)
    } else {
      params.set(key, newValue ? '1' : '0')
    }

    const newUrl = params.toString()
      ? `${window.location.pathname}?${params.toString()}`
      : window.location.pathname
    window.history.replaceState({}, '', newUrl)
  }, [key, defaultValue])

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlValue = params.get(key)
      if (urlValue === null) {
        setValue(defaultValue)
      } else {
        setValue(urlValue === 'true' || urlValue === '1')
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [key, defaultValue])

  return [value, setValueAndUrl]
}

/**
 * Get all current URL params as an object
 */
export function getUrlParams(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const params = new URLSearchParams(window.location.search)
  const result: Record<string, string> = {}
  params.forEach((value, key) => {
    result[key] = value
  })
  return result
}

/**
 * Update multiple URL params at once
 */
export function setUrlParams(updates: Record<string, string | null>): void {
  const params = new URLSearchParams(window.location.search)

  for (const [key, value] of Object.entries(updates)) {
    if (value === null || value === '' || value === 'all') {
      params.delete(key)
    } else {
      params.set(key, value)
    }
  }

  const newUrl = params.toString()
    ? `${window.location.pathname}?${params.toString()}`
    : window.location.pathname
  window.history.replaceState({}, '', newUrl)
}
