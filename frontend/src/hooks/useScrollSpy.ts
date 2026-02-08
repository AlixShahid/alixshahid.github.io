import { useEffect } from 'preact/hooks'

export let activeSection = 'hero'

export function useScrollSpy(sectionIds: readonly string[]) {
    useEffect(() => {
        const update = () => {
            const scrollY = window.scrollY
            const winH = window.innerHeight
            let best = sectionIds[0]

            for (const id of sectionIds) {
                const el = document.getElementById(id)
                if (!el) continue
                const top = el.offsetTop
                const bottom = top + el.offsetHeight
                if (scrollY + winH * 0.4 >= top && scrollY + winH * 0.4 < bottom) {
                    best = id
                }
            }

            if (scrollY + winH >= document.documentElement.scrollHeight - 50) {
                best = sectionIds[sectionIds.length - 1]
            }

            activeSection = best
        }

        window.addEventListener('scroll', update, { passive: true })
        update()
        return () => window.removeEventListener('scroll', update)
    }, [sectionIds])
}
