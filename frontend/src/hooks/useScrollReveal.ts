import { useEffect } from 'preact/hooks'

export function useScrollReveal(containerRef: { current: HTMLElement | null }) {
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) entry.target.classList.add('v')
                }
            },
            { threshold: 0.06, rootMargin: '0px 0px -40px 0px' },
        )

        container.querySelectorAll('.rv').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [containerRef])
}
