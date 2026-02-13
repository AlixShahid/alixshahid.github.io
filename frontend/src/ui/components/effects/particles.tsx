import { useEffect } from 'preact/hooks'

import { palette } from '$exporter/data'


const COLORS = [...palette.clickSpark]


function spawnDot(x: number, y: number, color: string, vxBase: number, vyBase: number, decay: number) {
    const el = document.createElement('div')
    const size = 2 + Math.random() * 2
    el.style.cssText = `position:fixed;width:${size}px;height:${size}px;background:${color};border-radius:50%;pointer-events:none;z-index:300000;left:${x}px;top:${y}px;box-shadow:0 0 4px ${color}`
    document.body.appendChild(el)

    let ox = 0
    let oy = 0
    let op = 1

    const animate = () => {
        ox += vxBase
        oy += vyBase + 0.8
        op -= decay
        el.style.transform = `translate(${ox}px,${oy}px)`
        el.style.opacity = `${Math.max(op, 0)}`
        if (op > 0) requestAnimationFrame(animate)
        else el.remove()
    }
    animate()
}

export default function Particles() {
    useEffect(() => {
        const onKeyDown = (_e: KeyboardEvent) => {
            const inp = document.querySelector<HTMLInputElement>('.tinput')
            if (!inp || document.activeElement !== inp) return

            const rect = inp.getBoundingClientRect()
            const x = rect.left + inp.value.length * 7.5 + 8
            const y = rect.top + rect.height / 2

            for (let i = 0; i < 2; i++) {
                const angle = Math.random() * Math.PI * 2
                const col = palette.keystroke[i]
                spawnDot(x, y, col, Math.cos(angle) * 0.4, Math.sin(angle) * 0.4 - 0.4, 0.06)
            }
        }

        const onClick = (e: MouseEvent) => {
            for (let i = 0; i < 6; i++) {
                const angle = Math.random() * Math.PI * 2
                const vel = 50 + Math.random() * 70
                spawnDot(
                    e.clientX,
                    e.clientY,
                    COLORS[i % 3],
                    Math.cos(angle) * vel * 0.02,
                    Math.sin(angle) * vel * 0.02,
                    0.03,
                )
            }
        }

        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('click', onClick)
        return () => {
            document.removeEventListener('keydown', onKeyDown)
            document.removeEventListener('click', onClick)
        }
    }, [])

    return null
}
