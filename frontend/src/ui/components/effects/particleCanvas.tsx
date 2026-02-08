import { useEffect } from 'preact/hooks'
import { usePreactRef, mouse } from '$exporter/hook'

const COUNT = 60
const CONN = 140
const MRAD = 180

class Particle {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    a: number

    constructor(w: number, h: number) {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.r = Math.random() * 1.2 + 0.4
        this.a = Math.random() * 0.15 + 0.05
    }

    update(w: number, h: number) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const d = Math.sqrt(dx * dx + dy * dy)

        if (d < MRAD && d > 0) {
            const f = ((MRAD - d) / MRAD) * 0.006
            this.vx += (dx / d) * f
            this.vy += (dy / d) * f
        }

        this.vx *= 0.995
        this.vy *= 0.995
        this.x += this.vx
        this.y += this.vy

        if (this.x < -10) this.x = w + 10
        if (this.x > w + 10) this.x = -10
        if (this.y < -10) this.y = h + 10
        if (this.y > h + 10) this.y = -10
    }

    draw(ctx: CanvasRenderingContext2D) {
        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const d = Math.sqrt(dx * dx + dy * dy)
        const g = d < MRAD ? (MRAD - d) / MRAD : 0

        ctx.beginPath()
        ctx.arc(this.x, this.y, this.r + g * 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(232,98,44,${this.a + g * 0.3})`
        ctx.fill()
    }
}

function drawConnections(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x
            const dy = particles[i].y - particles[j].y
            const d = Math.sqrt(dx * dx + dy * dy)

            if (d < CONN) {
                const a = (1 - d / CONN) * 0.04
                const mx = (particles[i].x + particles[j].x) / 2
                const my = (particles[i].y + particles[j].y) / 2
                const md = Math.sqrt((mouse.x - mx) ** 2 + (mouse.y - my) ** 2)
                const mb = md < MRAD ? ((MRAD - md) / MRAD) * 0.08 : 0

                ctx.beginPath()
                ctx.moveTo(particles[i].x, particles[i].y)
                ctx.lineTo(particles[j].x, particles[j].y)
                ctx.strokeStyle = `rgba(232,98,44,${a + mb})`
                ctx.lineWidth = 0.5
                ctx.stroke()
            }
        }
    }
}

export default function ParticleCanvas() {
    const canvasRef = usePreactRef<HTMLCanvasElement>()

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let W = (canvas.width = window.innerWidth)
        let H = (canvas.height = window.innerHeight)
        const particles: Particle[] = []
        let animId: number

        for (let i = 0; i < COUNT; i++) particles.push(new Particle(W, H))

        const onResize = () => {
            W = canvas.width = window.innerWidth
            H = canvas.height = window.innerHeight
        }
        window.addEventListener('resize', onResize)

        const loop = () => {
            ctx.clearRect(0, 0, W, H)
            for (const p of particles) {
                p.update(W, H)
                p.draw(ctx)
            }
            drawConnections(ctx, particles)
            animId = requestAnimationFrame(loop)
        }
        loop()

        return () => {
            window.removeEventListener('resize', onResize)
            cancelAnimationFrame(animId)
        }
    }, [])

    return <canvas ref={canvasRef} style={{ position: 'fixed', inset: '0', zIndex: 0, pointerEvents: 'none' }} />
}
