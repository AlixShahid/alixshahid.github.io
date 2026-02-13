import { useEffect } from 'preact/hooks'

import { usePreactRef } from '$exporter/hook'
import { EQUATIONS } from '$exporter/data'
import { rgb, rgba } from '$exporter/data'

import './equations.css'

export default function Equations() {
    const ref = usePreactRef<HTMLDivElement>()

    useEffect(() => {
        const container = ref.current
        if (!container) return

        function spawn() {
            const el = document.createElement('div')
            el.className = 'eq'
            el.textContent = EQUATIONS[Math.floor(Math.random() * EQUATIONS.length)]
            el.style.left = `${Math.random() * 100}%`
            el.style.animationDuration = `${22 + Math.random() * 20}s`
            el.style.fontSize = `${0.5 + Math.random() * 0.3}rem`
            el.style.color = rgba(rgb.green, 0.015 + Math.random() * 0.02)

            container!.appendChild(el)
            setTimeout(() => el.remove(), 42000)
        }

        for (let i = 0; i < 5; i++) setTimeout(spawn, i * 500)
        const interval = setInterval(spawn, 2500)

        return () => {
            clearInterval(interval)
            container.innerHTML = ''
        }
    }, [])

    return <div id="eqs" className="eqs" ref={ref} />
}
