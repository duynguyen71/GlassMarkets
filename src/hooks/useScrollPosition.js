import { useEffect, useState } from 'react'

/**
 * Hook to track scroll position and determine if scroll-to-top button should be visible
 * @param {number} threshold - Scroll distance (px) before showing the button (default: 300)
 * @returns {boolean} - Whether the scroll position is past the threshold
 */
export default function useScrollPosition(threshold = 300) {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset
      setShowButton(scrollY > threshold)
    }

    // Check initial scroll position
    handleScroll()

    // Add scroll listener with throttling for performance
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [threshold])

  return showButton
}
