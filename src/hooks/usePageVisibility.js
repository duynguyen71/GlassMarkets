import { useEffect, useRef, useState } from 'react'

/**
 * Hook to detect when page becomes visible again after being hidden/idle
 * Useful for triggering data refresh when user returns to the tab
 *
 * @param {number} minHiddenTime - Minimum time (ms) page must be hidden before triggering refresh on visibility
 * @returns {{ isVisible: boolean, lastVisibleChange: number, shouldRefresh: boolean }}
 */
export default function usePageVisibility(minHiddenTime = 60000) {
  const [isVisible, setIsVisible] = useState(!document.hidden)
  const [shouldRefresh, setShouldRefresh] = useState(false)
  const hiddenTimeRef = useRef(null)
  const lastVisibleChangeRef = useRef(Date.now())

  useEffect(() => {
    const handleVisibilityChange = () => {
      const nowVisible = !document.hidden
      const now = Date.now()

      if (nowVisible) {
        // Page became visible
        const wasHiddenFor = hiddenTimeRef.current ? now - hiddenTimeRef.current : 0

        // Trigger refresh if page was hidden for longer than minHiddenTime
        if (wasHiddenFor >= minHiddenTime) {
          setShouldRefresh(true)
          // Auto-reset shouldRefresh after a brief moment
          setTimeout(() => setShouldRefresh(false), 1000)
        }

        hiddenTimeRef.current = null
        lastVisibleChangeRef.current = now
      } else {
        // Page became hidden - record the time
        hiddenTimeRef.current = now
      }

      setIsVisible(nowVisible)
    }

    // Listen to visibility change events
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen to focus events (for Safari and mobile browsers)
    window.addEventListener('focus', handleVisibilityChange)
    window.addEventListener('blur', () => {
      if (!hiddenTimeRef.current) {
        hiddenTimeRef.current = Date.now()
      }
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
      window.removeEventListener('blur', handleVisibilityChange)
    }
  }, [minHiddenTime])

  return {
    isVisible,
    shouldRefresh,
    lastVisibleChange: lastVisibleChangeRef.current,
  }
}
