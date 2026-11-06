import { useEffect, useState } from 'react'

export function usePageEffects() {
  const [active, setActive] = useState('home')
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('main section[id]'),
    )
    const updateActive = () => {
      const threshold = Math.min(260, window.innerHeight * 0.35)
      const current = sections
        .filter((section) => section.getBoundingClientRect().top <= threshold)
        .at(-1)
      if (current) setActive(current.id)
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8
      )
        setActive('contact')
    }
    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return () => window.removeEventListener('scroll', updateActive)
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.08 },
    )
    document.querySelectorAll('[data-reveal]').forEach((element) => {
      element.classList.add('will-reveal')
      observer.observe(element)
    })
    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', updateActive)
    }
  }, [])
  return active
}
