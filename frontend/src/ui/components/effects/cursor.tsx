import { useEffect } from 'preact/hooks'
import { usePreactRef, mouse } from '$exporter/hook'

import "./cursor.css"

export default function Cursor() {
    const ref = usePreactRef<HTMLDivElement>()

    useEffect(() => {
        const el = ref.current
        if (!el) return

        let animId: number
        const track = () => {
            el.style.left = `${mouse.x}px`
            el.style.top = `${mouse.y}px`
            animId = requestAnimationFrame(track)
        }
        track()
        return () => cancelAnimationFrame(animId)
    }, [])

    useEffect(() => {
        const cursor = ref.current
        if (!cursor) return

        const onOver = (e: Event) => {
            if ((e.target as HTMLElement).closest('[data-h]')) cursor.classList.add('h')
        }
        const onOut = (e: Event) => {
            if ((e.target as HTMLElement).closest('[data-h]')) cursor.classList.remove('h')
        }

        document.addEventListener('mouseover', onOver)
        document.addEventListener('mouseout', onOut)
        return () => {
            document.removeEventListener('mouseover', onOver)
            document.removeEventListener('mouseout', onOut)
        }
    }, [])

    return <div className="cur" ref={ref} />
}
