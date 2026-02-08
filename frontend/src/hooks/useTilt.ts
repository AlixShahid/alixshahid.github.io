import { useEffect } from 'preact/hooks'
import { usePreactRef, type ElementRef } from './usePreactRef.ts'

export function useTilt<T extends HTMLElement = HTMLElement>(): ElementRef<T> {
    const ref = usePreactRef<T>()

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const onMove = (e: MouseEvent) => {
            const r = el.getBoundingClientRect()
            const x = (e.clientX - r.left) / r.width - 0.5
            const y = (e.clientY - r.top) / r.height - 0.5
            el.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`
            el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
            el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
        }

        const onLeave = () => {
            el.style.transform = 'perspective(800px) rotateY(0) rotateX(0)'
        }

        el.addEventListener('mousemove', onMove)
        el.addEventListener('mouseleave', onLeave)
        return () => {
            el.removeEventListener('mousemove', onMove)
            el.removeEventListener('mouseleave', onLeave)
        }
    }, [])

    return ref
}
