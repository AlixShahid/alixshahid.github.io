import { useEffect, useRef, useCallback } from 'preact/hooks'
import {
    usePreactRef,
    useTerminalOpen,
    useTerminalAlive,
    closeTerminal,
    killTerminal,
    toggleMaximize,
    termState,
    useDrag,
    bh,
    mouse,
} from '$exporter/hook'
import { BOOT_HTML } from '$exporter/data'
import { execCommand, getCwd, getCompletions } from './commands.ts'


import './terminal.css'

let clientIp = '127.0.0.1'
let clientAgent = 'unknown'

// detect browser
const ua = navigator.userAgent.toLowerCase()
if (ua.includes('firefox')) clientAgent = 'firefox'
else if (ua.includes('edg')) clientAgent = 'edge'
else if (ua.includes('chrome')) clientAgent = 'chrome'
else if (ua.includes('safari')) clientAgent = 'safari'

// fetch IP
fetch('https://api.ipify.org?format=text')
    .then(r => r.text())
    .then(ip => { clientIp = ip.trim() })
    .catch(() => { })

function promptTop(): string {
    return `<div class="tp-top"><span class="tp-branch">╭─</span>[<span class="u">${clientIp}</span><span class="p">@</span><span class="h">${clientAgent}</span>] [<span class="tc">${getCwd()}</span>]</div>`
}

function promptBottom(): string {
    return `<span class="tp"><span class="tp-branch">╰─</span><span class="d">$&nbsp;</span></span>`
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export default function Terminal() {
    const isOpen = useTerminalOpen()
    const isAlive = useTerminalAlive()

    const wrapperRef = usePreactRef<HTMLDivElement>()
    const termRef = usePreactRef<HTMLDivElement>()
    const bodyRef = usePreactRef<HTMLDivElement>()
    const resizeRef = usePreactRef<HTMLDivElement>()
    const lastBounds = useRef<{ l: number; t: number; w: number; h: number } | null>(null)

    const historyRef = useRef<string[]>([])
    const histIdxRef = useRef(-1)
    const inputRef = useRef<HTMLInputElement | null>(null)
    const bootedRef = useRef(false)
    const matrixRef = useRef<{ on: boolean; canvas: HTMLCanvasElement | null; frameId: number }>({
        on: false,
        canvas: null,
        frameId: 0,
    })

    useDrag(wrapperRef, termRef, resizeRef)

    // position and show/hide
    useEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper) return

        const getDockPos = () => {
            const dock = document.querySelector('.dock-btn')
            if (!dock) return null
            const r = dock.getBoundingClientRect()
            return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
        }

        if (isOpen) {
            // restore or compute position FIRST before any animation
            if (lastBounds.current) {
                wrapper.style.left = `${lastBounds.current.l}px`
                wrapper.style.top = `${lastBounds.current.t}px`
                wrapper.style.width = `${lastBounds.current.w}px`
                wrapper.style.height = `${lastBounds.current.h}px`
            } else if (!termState.maximized) {
                const ww = Math.min(1000, window.innerWidth * 0.92)
                const wh = Math.min(700, window.innerHeight * 0.82)
                wrapper.style.width = `${ww}px`
                wrapper.style.height = `${wh}px`
                wrapper.style.left = `${(window.innerWidth - ww) / 2}px`
                wrapper.style.top = `${Math.max(window.innerHeight * 0.1, (window.innerHeight - wh) / 2)}px`
            }

            const dp = getDockPos()
            if (dp) wrapper.style.transformOrigin = `${dp.x}px ${dp.y}px`

            wrapper.classList.remove('poof', 'genie')
            wrapper.style.transition = 'none'
            wrapper.style.opacity = '0'
            wrapper.style.transform = 'scale(0.05)'
            wrapper.style.filter = ''

            wrapper.classList.add('vis')
            wrapper.offsetHeight // reflow

            wrapper.classList.add('genie-in')
            wrapper.style.opacity = '1'
            wrapper.style.transform = 'scale(1)'

            setTimeout(() => {
                wrapper.classList.remove('genie-in')
                wrapper.style.transition = ''
                wrapper.style.transform = ''
                wrapper.style.transformOrigin = ''
                // refocus input
                inputRef.current?.focus()
            }, 550)
        } else {
            if (!termState.alive) return

            // save position using computed values, not style strings
            const rect = wrapper.getBoundingClientRect()
            lastBounds.current = {
                l: rect.left,
                t: rect.top,
                w: rect.width,
                h: rect.height,
            }

            const dp = getDockPos()
            if (dp) wrapper.style.transformOrigin = `${dp.x}px ${dp.y}px`

            wrapper.classList.add('genie')

            setTimeout(() => {
                wrapper.classList.remove('vis', 'genie')
                wrapper.style.transition = ''
                wrapper.style.transform = ''
                wrapper.style.opacity = ''
                wrapper.style.transformOrigin = ''
            }, 500)
        }
    }, [isOpen])

    // boot
    useEffect(() => {
        if (!isAlive || bootedRef.current) return
        const body = bodyRef.current
        if (!body) return

        body.innerHTML = ''
        bootedRef.current = true

        const card = document.createElement('div')
        card.className = 'tl'
        card.innerHTML = BOOT_HTML
        body.appendChild(card)

        const bootLines = [
            '',
            // '<span class="tg">▸ session started</span>',
            // '<span class="tg">▸ portfolio loaded</span>',
            // '',
            '<span class="tt">Type</span> <span class="tc">help</span> <span class="tt">for commands.</span> <span class="td">Tab autocompletes.</span>',
            '',
        ]
        for (const line of bootLines) addLine(body, line)
        createInput(body)

        setTimeout(() => inputRef.current?.focus(), 450)
    }, [isAlive])

    // reset on kill
    useEffect(() => {
        if (!isAlive) {
            bootedRef.current = false
            lastBounds.current = null
            const body = bodyRef.current
            if (body) body.innerHTML = ''
        }
    }, [isAlive])

    // maximize/restore
    useEffect(() => {
        const wrapper = wrapperRef.current
        if (!wrapper || !isOpen) return

        if (termState.maximized) {
            wrapper.style.width = '100%'
            wrapper.style.height = '100%'
            wrapper.style.top = '0px'
            wrapper.style.left = '0px'
            wrapper.style.transform = 'none'
        } else if (termState.prevBounds) {
            const b = termState.prevBounds
            wrapper.style.width = `${b.w}px`
            wrapper.style.height = `${b.h}px`
            wrapper.style.top = `${b.t}px`
            wrapper.style.left = `${b.l}px`
            wrapper.style.transform = 'none'
        }
    }, [isOpen, termState.maximized])

    function addLine(container: HTMLElement, html: string) {
        const div = document.createElement('div')
        div.className = 'tl'
        div.innerHTML = html
        const inp = container.querySelector('.tir')
        if (inp) container.insertBefore(div, inp)
        else container.appendChild(div)
        container.scrollTop = container.scrollHeight
    }

    function createInput(container: HTMLElement) {
        // remove old input row
        const old = container.querySelector('.tir')
        if (old) old.remove()

        const row = document.createElement('div')
        row.className = 'tl tir'
        row.innerHTML = promptTop() + promptBottom()

        const inp = document.createElement('input')
        inp.type = 'text'
        inp.className = 'tinput'
        inp.autocomplete = 'off'
        inp.spellcheck = false
        row.appendChild(inp)
        container.appendChild(row)
        inputRef.current = inp
        inp.focus()

        inp.addEventListener('keydown', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const raw = inp.value.trim()
                if (raw) {
                    historyRef.current.unshift(raw)
                    histIdxRef.current = -1
                }
                row.innerHTML = promptTop() + promptBottom() + `<span class="tc">${esc(raw)}</span>`

                row.classList.remove('tir')
                inputRef.current = null
                if (raw) handleCommand(container, raw)
                else createInput(container)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                if (histIdxRef.current < historyRef.current.length - 1) {
                    histIdxRef.current++
                    inp.value = historyRef.current[histIdxRef.current]
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault()
                if (histIdxRef.current > 0) {
                    histIdxRef.current--
                    inp.value = historyRef.current[histIdxRef.current]
                } else {
                    histIdxRef.current = -1
                    inp.value = ''
                }
            } else if (e.key === 'Tab') {
                e.preventDefault()
                e.stopPropagation()
                const { complete, options } = getCompletions(inp.value)
                if (complete) {
                    inp.value = complete
                    if (row.nextElementSibling?.classList.contains('tab-opts')) row.nextElementSibling.remove()
                } else if (options.length > 1) {
                    if (row.nextElementSibling?.classList.contains('tab-opts')) row.nextElementSibling.remove()
                    const parts = inp.value.trimStart().split(/\s+/)
                    const typed = parts.slice(1).join(' ').trim()
                    const optDiv = document.createElement('div')
                    optDiv.className = 'tl tab-opts'
                    optDiv.innerHTML = options.map(o => {
                        const display = typed && o.toLowerCase().startsWith(typed.toLowerCase()) ? o.slice(typed.length) : o
                        return `<span class="th">${display}</span>`
                    }).join('  ')
                    row.after(optDiv)
                    container.scrollTop = container.scrollHeight
                }

            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault()
                row.innerHTML = promptTop() + promptBottom() + `<span class="tc">${esc(inp.value)}</span><span class="te">^C</span>`
                row.classList.remove('tir')
                inputRef.current = null
                createInput(container)
            }
        })

        inp.addEventListener('mousedown', (e: Event) => e.stopPropagation())

        container.onclick = (e: Event) => {
            if (window.getSelection()?.toString()) return
            if (!(e.target as HTMLElement).closest('a') && inputRef.current) inputRef.current.focus()

        }

        container.scrollTop = container.scrollHeight
    }

    function handleCommand(container: HTMLElement, raw: string) {
        const args = raw.trim().split(/\s+/)
        const cmd = args[0].toLowerCase()

        if (cmd === 'exit') {
            addLine(container, '<span class="tg">▸ session ended</span>')
            setTimeout(killTerminal, 400)
            return
        }

        if (cmd === 'clear' || cmd === 'cls') {
            doClear(container)
            return
        }

        if (cmd === 'matrix') {
            doMatrix(container)
            createInput(container)
            return
        }

        const output = execCommand(cmd, args.slice(1))
        for (const line of output) addLine(container, line)
        createInput(container)
    }

    function doClear(container: HTMLElement) {
        const lines = Array.from(container.querySelectorAll<HTMLElement>('.tl'))
        if (!lines.length) {
            createInput(container)
            return
        }

        lines.forEach((line, i) => {
            setTimeout(() => {
                const rect = line.getBoundingClientRect()
                line.style.transition = 'transform .5s cubic-bezier(.55,.06,.68,.19),opacity .4s,filter .3s'
                line.style.transform = `translate(${bh.curX - rect.left - rect.width / 2}px,${bh.curY - rect.top - rect.height / 2}px) scale(0) rotate(${Math.random() * 360}deg)`
                line.style.opacity = '0'
                line.style.filter = 'blur(3px)'
            }, i * 20)
        })

        setTimeout(() => {
            lines.forEach(l => l.remove())
            createInput(container)
        }, lines.length * 20 + 600)
    }

    function doMatrix(container: HTMLElement) {
        const mat = matrixRef.current
        mat.on = !mat.on

        if (mat.on) {
            addLine(container, '<span class="tg">▸ matrix: on</span>')
            if (!mat.canvas) {
                mat.canvas = document.createElement('canvas')
                mat.canvas.style.cssText = 'position:fixed;inset:0;z-index:90;pointer-events:none;transition:opacity .5s'
                document.body.appendChild(mat.canvas)
            }
            const c = mat.canvas
            const ctx = c.getContext('2d')!
            c.width = window.innerWidth
            c.height = window.innerHeight
            c.style.opacity = '0.4'

            const cols = Math.floor(c.width / 16)
            const chars = '01アカサタナハマヤラワ日月火水木金土'.split('')
            let lastTime = 0
            const speed = 50

            // each drop has x offset and y position
            const drops: { x: number; y: number; vx: number; vy: number }[] = []
            for (let i = 0; i < cols; i++) {
                drops.push({
                    x: i * 16,
                    y: Math.random() * -100 * 16,
                    vx: 0,
                    vy: 16, // normal fall speed: 1 row per frame
                })
            }

            const draw = (time: number) => {
                if (time - lastTime < speed) {
                    mat.frameId = requestAnimationFrame(draw)
                    return
                }
                lastTime = time

                ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
                ctx.fillRect(0, 0, c.width, c.height)
                ctx.font = '14px IBM Plex Mono'

                const bhActive = bh.intensity > 0.01
                const bhX = bh.curX
                const bhY = bh.curY
                const pull = bh.intensity * 8

                for (const d of drops) {
                    // mouse repulsion
                    const mx = mouse.x - d.x
                    const my = mouse.y - d.y
                    const mDist = Math.sqrt(mx * mx + my * my)
                    if (mDist < 150 && mDist > 1) {
                        const force = (150 - mDist) / 150 * 3
                        d.vx -= (mx / mDist) * force
                        d.vy -= (my / mDist) * force
                    }

                    if (bhActive) {
                        const dx = bhX - d.x
                        const dy = bhY - d.y
                        const dist = Math.sqrt(dx * dx + dy * dy)
                        if (dist > 1) {
                            const str = pull / (dist * 0.05 + 1)
                            d.vx += (dx / dist) * str
                            d.vy += (dy / dist) * str
                            d.vx += (-dy / dist) * str * 0.3
                            d.vy += (dx / dist) * str * 0.3
                        }
                        d.vx *= 0.95
                        d.vy *= 0.95

                        if (dist < 30) {
                            d.x = Math.floor(Math.random() * cols) * 16
                            d.y = -16
                            d.vx = 0
                            d.vy = 16
                            continue
                        }
                    } else {
                        d.vx *= 0.9
                        d.vy += (16 - d.vy) * 0.1
                    }

                    d.x += d.vx
                    d.y += d.vy

                    const char = chars[Math.floor(Math.random() * chars.length)]

                    // glow brighter near cursor
                    const glow = mDist < 200 ? 1 - mDist / 200 : 0
                    const headR = Math.min(255, 255)
                    const headG = Math.min(255, 255 + glow * 50)
                    const headB = Math.min(255, 255)

                    ctx.fillStyle = glow > 0.3 ? `rgba(${headR},${headG},${headB},${0.8 + glow * 0.2})` : '#fff'
                    ctx.fillText(char, d.x, d.y)

                    ctx.fillStyle = `rgba(32, 194, 14, ${0.8 + glow * 0.2})`
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], d.x, d.y - 16)

                    ctx.fillStyle = `rgba(32, 194, 14, ${0.4 + glow * 0.3})`
                    ctx.fillText(chars[Math.floor(Math.random() * chars.length)], d.x, d.y - 32)

                    if (d.y > c.height + 50 || d.x < -50 || d.x > c.width + 50) {
                        d.x = Math.floor(Math.random() * cols) * 16
                        d.y = -16
                        d.vx = 0
                        d.vy = 16
                    }
                }


                mat.frameId = requestAnimationFrame(draw)
            }
            mat.frameId = requestAnimationFrame(draw)
        } else {
            addLine(container, '<span class="ta">▸ matrix: off</span>')
            if (mat.frameId) cancelAnimationFrame(mat.frameId)
            if (mat.canvas) {
                mat.canvas.style.opacity = '0'
                const c = mat.canvas
                const ctx = c.getContext('2d')
                setTimeout(() => { if (ctx) ctx.clearRect(0, 0, c.width, c.height) }, 500)
            }
        }
    }

    const onClose = useCallback((e: Event) => {
        e.stopPropagation()
        killTerminal()
    }, [])

    const onMinimize = useCallback((e: Event) => {
        e.stopPropagation()
        closeTerminal()
    }, [])

    const onMaximize = useCallback((e: Event) => {
        e.stopPropagation()
        toggleMaximize(wrapperRef.current)
    }, [])

    const onTitleDblClick = useCallback((e: Event) => {
        if (!(e.target as HTMLElement).closest('.tbtn')) {
            toggleMaximize(wrapperRef.current)
        }
    }, [])

    return (
        <div className="tw" ref={wrapperRef} id="tw">
            <div className="term" ref={termRef} id="term">
                <div className="tbar" id="tbar" onDblClick={onTitleDblClick}>
                    <div className="tbtn-wrap">
                        <div className="tbtn cl" onClick={onClose} data-tip="close" data-h />
                        <div className="tbtn mi" onClick={onMinimize} data-tip="minimize" data-h />
                        <div className="tbtn mx" onClick={onMaximize} data-tip="maximize" data-h />
                    </div>
                    <div className="tbar-title">ali@shahid: Terminal</div>
                    <div className="tbar-st">ssh</div>
                </div>
                <div className="tbody" ref={bodyRef} id="tbody" />
                <div className="tresize" ref={resizeRef} id="trsz" />
                <div className="term-scan" />
            </div>
        </div>
    )
}
