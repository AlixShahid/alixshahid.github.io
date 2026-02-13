import { useEffect } from 'preact/hooks'
import { usePreactRef, mouse, bh } from '$exporter/hook'

import './cursor.css'

export default function Cursor() {
    const curRef = usePreactRef<HTMLDivElement>()
    const dotRef = usePreactRef<HTMLDivElement>()
    const lensRef = usePreactRef<HTMLDivElement>()

    useEffect(() => {
        const cur = curRef.current
        const dot = dotRef.current
        const lens = lensRef.current
        if (!cur || !dot || !lens) return

        let cx = 0
        let cy = 0
        let animId: number

        const track = () => {
            cx += (mouse.x - cx) * 0.15
            cy += (mouse.y - cy) * 0.15
            cur.style.left = `${cx + bh.cursorAttrX - 10}px`
            cur.style.top = `${cy + bh.cursorAttrY - 10}px`
            dot.style.left = `${mouse.x + bh.cursorAttrX * 0.3 - 1.5}px`
            dot.style.top = `${mouse.y + bh.cursorAttrY * 0.3 - 1.5}px`
            lens.style.left = `${cx + bh.cursorAttrX * 0.5 - 30}px`
            lens.style.top = `${cy + bh.cursorAttrY * 0.5 - 30}px`
            animId = requestAnimationFrame(track)
        }
        track()
        return () => cancelAnimationFrame(animId)
    }, [])

    useEffect(() => {
        const cur = curRef.current
        if (!cur) return

        const onOver = (e: Event) => {
            if ((e.target as HTMLElement).closest('[data-h]')) cur.classList.add('hover')
        }
        const onOut = (e: Event) => {
            if ((e.target as HTMLElement).closest('[data-h]')) cur.classList.remove('hover')
        }

        document.addEventListener('mouseover', onOver)
        document.addEventListener('mouseout', onOut)
        return () => {
            document.removeEventListener('mouseover', onOver)
            document.removeEventListener('mouseout', onOut)
        }
    }, [])

    return (
        <>
            <div className="cursor" ref={curRef} />
            <div className="cursor-dot" ref={dotRef} />
            <div className="cursor-lens" ref={lensRef} />
        </>
    )
}
