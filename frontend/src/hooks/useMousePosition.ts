import { useEffect } from 'preact/hooks'

export const mouse = { x: -1000, y: -1000 }

export function useMousePosition() {
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            mouse.x = e.clientX
            mouse.y = e.clientY
        }
        document.addEventListener('mousemove', handler)
        return () => document.removeEventListener('mousemove', handler)
    }, [])
}
