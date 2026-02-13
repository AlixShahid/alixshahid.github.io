import { useEffect, useRef } from 'preact/hooks'
import {
    usePreactRef,
    mouse,
    bh,
    recalcBlackHoleRest,
    startBlackHoleHover,
    stopBlackHoleHover,
    triggerSuck,
    resetBlackHole,
} from '$exporter/hook'
import { rgb, rgba, palette } from '$exporter/data'


import './blackhole.css'

const BH_RADIUS = 22

interface DiskParticle {
    angle: number
    dist: number
    speed: number
    hue: number
    bright: number
    size: number
    tilt: number
}

interface DeathParticle {
    x: number
    y: number
    vx: number
    vy: number
    life: number
    r: number
    col: string
}

interface GravityElement {
    el: HTMLElement
    ox: number
    oy: number
    vx: number
    vy: number
    sc: number
    mass: number
    curve: number
}

function buildDiskParticles(): DiskParticle[] {
    const particles: DiskParticle[] = []
    for (let i = 0; i < 500; i++) {
        const dist = BH_RADIUS * 1.5 + Math.random() * 60
        particles.push({
            angle: Math.random() * Math.PI * 2,
            dist,
            speed: Math.sqrt(1 / dist) * 6,
            hue: 15 + Math.random() * 30,
            bright: Math.max(0, 1 - (dist - BH_RADIUS * 1.5) / 60),
            size: 0.4 + Math.random() * 2,
            tilt: 0.18 + Math.random() * 0.12,
        })
    }
    return particles
}

function spawnDeathParticles(
    deathParts: DeathParticle[],
    sx: number,
    sy: number,
    n: number,
    w: number,
    h: number,
) {
    const cL = bh.curX - 200
    const cT = bh.curY - 200
    const cols = [...palette.death]

    for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        deathParts.push({
            x: sx + (Math.random() - 0.5) * w - cL,
            y: sy + (Math.random() - 0.5) * h - cT,
            vx: Math.cos(a) * (2 + Math.random() * 3),
            vy: Math.sin(a) * (2 + Math.random() * 3),
            life: 0.6 + Math.random() * 0.4,
            r: 1.5 + Math.random() * 3,
            col: cols[Math.floor(Math.random() * cols.length)],
        })
    }
}

export default function BlackHole() {
    const canvasRef = usePreactRef<HTMLCanvasElement>()
    const uiRef = usePreactRef<HTMLDivElement>()
    const countRef = usePreactRef<HTMLDivElement>()
    const flashRef = usePreactRef<HTMLDivElement>()
    const orbRef = usePreactRef<HTMLDivElement>()
    const ringRef = useRef<SVGCircleElement>(null)
    const centerRef = usePreactRef<HTMLDivElement>()

    const diskParticles = useRef(buildDiskParticles())
    const deathParticles = useRef<DeathParticle[]>([])
    const gravElements = useRef<GravityElement[]>([])

    // gather gravity targets
    useEffect(() => {
        const targets: [string, number][] = [
            ['heroContent', 3],
            ['tw', 2],
            ['eqs', 0.5],
        ]
        const dockEl = document.querySelector<HTMLElement>('.dock')

        const elements: GravityElement[] = []
        for (const [id, mass] of targets) {
            const el = document.getElementById(id)
            if (el) elements.push({ el, ox: 0, oy: 0, vx: 0, vy: 0, sc: 1, mass, curve: Math.random() > 0.5 ? 1 : -1 })
        }
        if (dockEl) elements.push({ el: dockEl, ox: 0, oy: 0, vx: 0, vy: 0, sc: 1, mass: 1.5, curve: Math.random() > 0.5 ? 1 : -1 })

        gravElements.current = elements

        window.addEventListener('resize', recalcBlackHoleRest)
        return () => window.removeEventListener('resize', recalcBlackHoleRest)
    }, [])

    // black hole canvas renderer
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        canvas.width = 400
        canvas.height = 400

        const disk = diskParticles.current

        function drawBlackHole(intensity: number) {
            const death = deathParticles.current
            ctx!.clearRect(0, 0, 400, 400)
            const cx = 200
            const cy = 200

            // accretion disk — behind pass
            ctx!.save()
            ctx!.translate(cx, cy)
            for (const p of disk) {
                p.angle += p.speed * 0.006 * (1 + intensity * 0.4)
                if (Math.sin(p.angle) > 0) continue // skip front-facing particles
                const x = Math.cos(p.angle) * p.dist
                const y = Math.sin(p.angle) * p.dist * p.tilt
                const beam = 1 + Math.cos(p.angle) * 0.5
                const al = p.bright * beam * (0.08 + intensity * 0.08)
                ctx!.fillStyle = `rgba(${Math.min(255, 170 + p.hue * 3)},${Math.min(255, 90 + p.hue * 2)},25,${Math.min(al, 0.3)})`
                ctx!.beginPath()
                ctx!.arc(x, y, p.size * (0.4 + beam * 0.4), 0, Math.PI * 2)
                ctx!.fill()
            }
            ctx!.restore()

            // event horizon
            const core = ctx!.createRadialGradient(cx, cy, 0, cx, cy, BH_RADIUS * 1.3)
            core.addColorStop(0, 'rgba(0,0,0,1)')
            core.addColorStop(0.8, 'rgba(0,0,0,.96)')
            core.addColorStop(1, 'rgba(0,0,0,0)')
            ctx!.fillStyle = core
            ctx!.beginPath()
            ctx!.arc(cx, cy, BH_RADIUS * 1.3, 0, Math.PI * 2)
            ctx!.fill()

            // accretion disk — front pass
            ctx!.save()
            ctx!.translate(cx, cy)
            for (const p of disk) {
                if (Math.sin(p.angle) <= 0) continue // skip back-facing particles
                const x = Math.cos(p.angle) * p.dist
                const y = Math.sin(p.angle) * p.dist * p.tilt
                const beam = 1 + Math.cos(p.angle) * 0.5
                const al = p.bright * beam * (0.1 + intensity * 0.1)
                ctx!.fillStyle = `rgba(${Math.min(255, 170 + p.hue * 3)},${Math.min(255, 90 + p.hue * 2)},25,${Math.min(al, 0.45)})`
                ctx!.beginPath()
                ctx!.arc(x, y, p.size * (0.5 + beam * 0.5), 0, Math.PI * 2)
                ctx!.fill()
            }
            ctx!.restore()

            // danger ring
            if (intensity > 0.01) {
                ctx!.beginPath()
                ctx!.arc(cx, cy, 90 + Math.sin(Date.now() * 0.002) * 3, 0, Math.PI * 2)
                ctx!.strokeStyle = rgba(rgb.red, intensity * 0.1)
                ctx!.lineWidth = 1
                ctx!.setLineDash([3, 8])
                ctx!.stroke()
                ctx!.setLineDash([])
            }

            // death particles
            if (death.length) {
                ctx!.save()
                for (let i = death.length - 1; i >= 0; i--) {
                    const p = death[i]
                    const pdx = 200 - p.x
                    const pdy = 200 - p.y
                    const pd = Math.sqrt(pdx * pdx + pdy * pdy)
                    if (pd > 2) {
                        p.vx += (pdx / pd) * 1.5
                        p.vy += (pdy / pd) * 1.5
                        p.vx += (-pdy / pd) * 0.5
                        p.vy += (pdx / pd) * 0.5
                    }
                    p.vx *= 0.96
                    p.vy *= 0.96
                    p.x += p.vx
                    p.y += p.vy
                    p.life -= 0.015
                    p.r *= 0.997
                    if (p.life <= 0 || pd < BH_RADIUS) {
                        death.splice(i, 1)
                        continue
                    }
                    ctx!.globalAlpha = Math.max(0, p.life)
                    ctx!.fillStyle = p.col
                    ctx!.shadowColor = p.col
                    ctx!.shadowBlur = p.r * 3
                    ctx!.beginPath()
                    ctx!.arc(p.x, p.y, Math.max(0.3, p.r), 0, Math.PI * 2)
                    ctx!.fill()
                }
                ctx!.shadowBlur = 0
                ctx!.globalAlpha = 1
                ctx!.restore()
            }
        }

        // main physics loop
        let animId: number

        function physics() {
            const W = window.innerWidth
            const death = deathParticles.current

            bh.curX += (bh.restX - bh.intensity * 10 - bh.curX) * 0.04
            bh.curY += (bh.restY + bh.intensity * 6 - bh.curY) * 0.04

            // hover ramp
            if (bh.hovering && !bh.sucked) {
                const elapsed = (Date.now() - bh.hoverStart) / 1000
                bh.targetIntensity = Math.min(elapsed / 10, 1)
                const newCount = Math.max(0, 10 - Math.floor(elapsed))
                if (newCount !== bh.countdown) {
                    bh.countdown = newCount
                    if (countRef.current) countRef.current.textContent = `${bh.countdown}`
                }
                if (elapsed >= 10 && !bh.sucked) {
                    uiRef.current?.classList.remove('on')
                    document.querySelector('.cursor')?.classList.remove('danger')
                    triggerSuck()
                }
            }

            bh.intensity += (bh.targetIntensity - bh.intensity) * 0.04

            // position canvas & UI
            canvas!.style.left = `${bh.curX - 200}px`
            canvas!.style.top = `${bh.curY - 200}px`
            if (uiRef.current) {
                uiRef.current.style.top = `${bh.curY + 120}px`
                uiRef.current.style.right = `${W - bh.curX + 20}px`
            }

            drawBlackHole(bh.intensity)

            // cursor gravitational pull
            if (bh.intensity > 0.01 && !bh.sucked) {
                const cdx = bh.curX - mouse.x
                const cdy = bh.curY - mouse.y
                const cd = Math.sqrt(cdx * cdx + cdy * cdy)
                if (cd > 1) {
                    const pull = (bh.intensity * bh.intensity * 40) / (cd * 0.2 + 60)
                    bh.cursorAttrX = (cdx / cd) * pull
                    bh.cursorAttrY = (cdy / cd) * pull
                }
            } else {
                bh.cursorAttrX *= 0.9
                bh.cursorAttrY *= 0.9
            }

            // element gravity
            if (bh.suckPhase < 2) {
                const releasing = bh.targetIntensity === 0 && !bh.sucked
                if (bh.intensity > 0.003) {
                    for (const g of gravElements.current) {
                        const isTw = g.el.id === 'tw'

                        if (releasing) {
                            g.vx *= 0.88
                            g.vy *= 0.88
                            g.ox *= 0.92
                            g.oy *= 0.92
                            g.sc += (1 - g.sc) * 0.06
                            if (Math.abs(g.ox) < 0.5 && Math.abs(g.oy) < 0.5 && g.sc > 0.99) {
                                g.ox = 0
                                g.oy = 0
                                g.vx = 0
                                g.vy = 0
                                g.sc = 1
                                g.el.style.transform = ''
                                if (!isTw) g.el.style.opacity = ''
                                g.el.style.filter = ''
                                continue
                            }
                            g.el.style.transform = `translate(${g.ox}px,${g.oy}px) scale(${g.sc})`
                            if (!isTw) g.el.style.opacity = `${Math.max(0.3, g.sc)}`
                            continue
                        }

                        const isSuck = bh.suckPhase === 1
                        const G = isSuck ? 400 : 150
                        const soft = 100
                        const damp = isSuck ? 0.975 : 0.985
                        const rect = g.el.getBoundingClientRect()
                        const ecx = rect.left + rect.width / 2
                        const ecy = rect.top + rect.height / 2
                        const dx = bh.curX - ecx
                        const dy = bh.curY - ecy
                        const dist = Math.sqrt(dx * dx + dy * dy)
                        if (dist < 1) continue
                        const str = (G * bh.intensity) / (dist + soft) / g.mass
                        g.vx += (dx / dist) * str
                        g.vy += (dy / dist) * str
                        const tang = str * (isSuck ? 0.2 : 0.35) * g.curve
                        g.vx += (-dy / dist) * tang
                        g.vy += (dx / dist) * tang
                        g.vx *= damp
                        g.vy *= damp
                        g.ox += g.vx
                        g.oy += g.vy
                        g.sc = Math.max(0.03, g.sc * (1 - (bh.intensity * (isSuck ? 0.06 : 0.025)) / g.mass))
                        g.el.style.transform = `translate(${g.ox}px,${g.oy}px) scale(${g.sc})`
                        if (!isTw) g.el.style.opacity = `${Math.max(0.08, g.sc)}`
                    }
                } else {
                    for (const g of gravElements.current) {
                        const isTw = g.el.id === 'tw'
                        if (g.ox === 0 && g.sc === 1) continue
                        g.vx *= 0.88
                        g.vy *= 0.88
                        g.ox *= 0.92
                        g.oy *= 0.92
                        g.sc += (1 - g.sc) * 0.06
                        if (Math.abs(g.ox) < 0.5 && Math.abs(g.oy) < 0.5 && g.sc > 0.99) {
                            g.ox = 0
                            g.oy = 0
                            g.vx = 0
                            g.vy = 0
                            g.sc = 1
                            g.el.style.transform = ''
                            if (!isTw) g.el.style.opacity = ''
                            g.el.style.filter = ''
                            continue
                        }
                        g.el.style.transform = `translate(${g.ox}px,${g.oy}px) scale(${g.sc})`
                        if (!isTw) g.el.style.opacity = `${Math.max(0.3, g.sc)}`
                    }
                }
            }

            // suck phase transitions
            if (bh.suckPhase === 1) {
                bh.suckTimer++
                if (bh.suckTimer > 150) {
                    bh.suckPhase = 2
                    gravElements.current.forEach((g, i) => {
                        setTimeout(() => {
                            const rect = g.el.getBoundingClientRect()
                            const dx = bh.curX - (rect.left + rect.width / 2)
                            const dy = bh.curY - (rect.top + rect.height / 2)
                            g.el.style.transition = 'transform .8s cubic-bezier(.55,.06,.68,.19),opacity .6s,filter .5s'
                            g.el.style.transform = `translate(${g.ox + dx}px,${g.oy + dy}px) scale(0)`
                            g.el.style.opacity = '0'
                            g.el.style.filter = 'blur(8px)'
                            spawnDeathParticles(death, bh.curX, bh.curY, 20, 50, 30)
                        }, i * 200)
                    })

                    // fade background
                    const bgCanvas = document.getElementById('bg')
                    const noise = document.querySelector<HTMLElement>('.noise')
                    if (bgCanvas) {
                        bgCanvas.style.transition = 'opacity 1.5s'
                        bgCanvas.style.opacity = '0'
                    }
                    if (noise) {
                        noise.style.transition = 'opacity 1s'
                        noise.style.opacity = '0'
                    }

                    const delay = gravElements.current.length * 200 + 1500
                    setTimeout(showWhiteHole, delay)
                    bh.suckPhase = 3
                }
            }

            animId = requestAnimationFrame(physics)
        }

        function showWhiteHole() {
            flashRef.current?.classList.add('on')
            setTimeout(() => {
                centerRef.current?.classList.add('on')
            }, 800)
        }

        physics()
        return () => cancelAnimationFrame(animId)
    }, [])

    // white hole release
    const releaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const releasedRef = useRef(false)

    const doRelease = () => {
        if (releasedRef.current) return
        releasedRef.current = true

        centerRef.current?.classList.remove('on')
        ringRef.current?.classList.remove('charging')

        setTimeout(() => {
            flashRef.current?.classList.remove('on')

            const bgCanvas = document.getElementById('bg') as HTMLCanvasElement | null
            const noise = document.querySelector<HTMLElement>('.noise')
            if (bgCanvas) {
                bgCanvas.style.transition = 'opacity 1s'
                bgCanvas.style.opacity = '1'
                bgCanvas.style.transform = ''
                setTimeout(() => { bgCanvas.style.transition = '' }, 1100)
            }
            if (noise) {
                noise.style.transition = 'opacity 1s'
                noise.style.opacity = '.03'
                setTimeout(() => { noise.style.transition = '' }, 1100)
            }

            gravElements.current.forEach((g, i) => {
                setTimeout(() => {
                    g.el.style.transition = 'transform 2s cubic-bezier(.16,1,.3,1),opacity 1.2s ease,filter .5s'
                    g.el.style.filter = ''
                    g.el.style.transform = ''
                    g.el.style.opacity = ''
                    setTimeout(() => {
                        g.el.style.transition = ''
                        g.ox = 0
                        g.oy = 0
                        g.vx = 0
                        g.vy = 0
                        g.sc = 1
                    }, 2100)
                }, i * 200)
            })

            resetBlackHole()
            deathParticles.current = []
            releasedRef.current = false
        }, 500)
    }

    const onOrbEnter = () => {
        ringRef.current?.classList.add('charging')
        releaseTimerRef.current = setTimeout(doRelease, 2500)
    }

    const onOrbLeave = () => {
        ringRef.current?.classList.remove('charging')
        // reset the offset so it snaps back
        if (ringRef.current) ringRef.current.style.strokeDashoffset = '339.292'
        if (releaseTimerRef.current) {
            clearTimeout(releaseTimerRef.current)
            releaseTimerRef.current = null
        }
    }

    const onTriggerEnter = () => {
        startBlackHoleHover()
        uiRef.current?.classList.add('on')
        if (countRef.current) countRef.current.textContent = '10'
        document.querySelector('.cursor')?.classList.add('danger')
    }

    const onTriggerLeave = () => {
        stopBlackHoleHover()
        uiRef.current?.classList.remove('on')
        document.querySelector('.cursor')?.classList.remove('danger')
    }

    return (
        <>
            <div id="bh-trigger" className="bh-trigger" onMouseEnter={onTriggerEnter} onMouseLeave={onTriggerLeave} />
            <canvas ref={canvasRef} id="bhc" className="bh-canvas" />
            <div className="bh-ui" ref={uiRef}>
                <div className="bh-t">⚠ gravitational anomaly ⚠</div>
                <div className="bh-n" ref={countRef}>10</div>
                <div className="bh-s">leave to stabilize</div>
            </div>

            <div id="wh-flash" className="wh-flash" ref={flashRef}>
                <div className="wh-center" ref={centerRef}>
                    <div className="wh-orb-wrap">
                        <svg className="wh-ring-svg" viewBox="0 0 120 120">
                            <circle className="wh-ring-track" cx="60" cy="60" r="54" />
                            <circle className="wh-ring-progress" ref={ringRef} cx="60" cy="60" r="54" />
                        </svg>
                        <div
                            className="wh-orb"
                            onMouseEnter={onOrbEnter}
                            onMouseLeave={onOrbLeave}
                            ref={orbRef}
                        />
                    </div>
                    <div className="wh-hint">hover to release</div>
                </div>
            </div>
        </>
    )
}
