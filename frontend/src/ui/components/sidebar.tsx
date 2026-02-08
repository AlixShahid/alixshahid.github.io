import { useEffect, useRef } from 'preact/hooks'

import { GithubIcon, LinkedInIcon } from '$exporter/component'
import { usePreactRef, mouse, activeSection } from '$exporter/hook'
import { SECTIONS, NAV_LABELS, SOCIAL_LINKS } from '$exporter/data'

import "./sidebar.css"

const RADIUS = 110
const MAX_SCALE = 1.6
const LERP = 0.1

function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t
}

export default function Sidebar() {
    const sidebarRef = usePreactRef<HTMLElement>()
    const itemsRef = useRef<(HTMLElement | null)[]>([])
    const stateRef = useRef(
        [...SECTIONS, 'gh', 'li'].map(() => ({ scale: 1, color: 0, margin: 0 })),
    )

    useEffect(() => {
        const items = itemsRef.current
        let animId: number

        const tick = () => {
            const sidebar = sidebarRef.current
            if (!sidebar) return

            const sidebarRight = sidebar.getBoundingClientRect().right
            const isNear = mouse.x < sidebarRight + 40

            items.forEach((item, i) => {
                if (!item) return
                const state = stateRef.current[i]
                const rect = item.getBoundingClientRect()
                const cy = rect.top + rect.height / 2
                const dist = Math.abs(mouse.y - cy)

                let tScale = 1
                let tColor = 0

                if (isNear && dist < RADIUS) {
                    const t = 1 - dist / RADIUS
                    const strength = (Math.cos(Math.PI * (1 - t)) + 1) / 2
                    tScale = 1 + (MAX_SCALE - 1) * strength
                    tColor = strength
                }

                state.scale = lerp(state.scale, tScale, LERP)
                state.color = lerp(state.color, tColor, LERP)

                const s = state.scale
                const c = state.color
                item.style.transform = `scale(${s})`

                const isPrimary = c > 0.85
                const isActive = item.dataset.section === activeSection
                item.classList.toggle('active', isActive)

                if (!isActive) {
                    const [dimR, dimG, dimB] = [154, 138, 120]
                    const [midR, midG, midB] = [180, 140, 110]
                    const [acR, acG, acB] = [232, 98, 44]
                    let r: number, g: number, b: number

                    if (isPrimary) {
                        const t2 = (c - 0.85) / 0.15
                        r = Math.round(midR + (acR - midR) * t2)
                        g = Math.round(midG + (acG - midG) * t2)
                        b = Math.round(midB + (acB - midB) * t2)
                    } else {
                        const t2 = Math.min(c / 0.85, 1)
                        r = Math.round(dimR + (midR - dimR) * t2)
                        g = Math.round(dimG + (midG - dimG) * t2)
                        b = Math.round(dimB + (midB - dimB) * t2)
                    }
                    item.style.color = `rgb(${r},${g},${b})`
                } else {
                    item.style.color = ''
                }

                item.style.fontWeight = isPrimary ? '500' : '400'

                const extraMargin = isPrimary ? ((c - 0.85) / 0.15) * 6 : 0
                state.margin = lerp(state.margin, extraMargin, LERP)
                item.style.marginTop = `${state.margin}px`
                item.style.marginBottom = `${state.margin}px`

                item.style.textShadow = isPrimary
                    ? `0 0 20px rgba(232,98,44,${((c - 0.85) / 0.15) * 0.3})`
                    : 'none'

                const hl = item.querySelector<HTMLElement>('.sb-highlight')
                if (hl) {
                    hl.style.background = isPrimary
                        ? `rgba(232,98,44,${((c - 0.85) / 0.15) * 0.06})`
                        : 'rgba(232,98,44,0)'
                }
            })

            animId = requestAnimationFrame(tick)
        }

        tick()
        return () => cancelAnimationFrame(animId)
    }, [])

    const setRef = (i: number) => (el: HTMLElement | null) => {
        itemsRef.current[i] = el
    }

    return (
        <nav className="sidebar" ref={sidebarRef}>
            {SECTIONS.map((id, i) => (
                <a key={id} href={`#${id}`} className="sb-item" data-section={id} data-h ref={setRef(i)}>
                    <span className="sb-highlight" />
                    {NAV_LABELS[id]}
                </a>
            ))}
            <div className="sb-divider" />
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener" className="sb-soc" data-h ref={setRef(SECTIONS.length)}>
                <GithubIcon size={14} />
            </a>
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener" className="sb-soc" data-h ref={setRef(SECTIONS.length + 1)}>
                <LinkedInIcon size={14} />
            </a>
        </nav>
    )
}
