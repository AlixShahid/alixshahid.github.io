import { useState, useEffect } from 'preact/hooks'

type Listener = () => void

export interface TerminalState {
    open: boolean
    alive: boolean
    maximized: boolean
    prevBounds: { w: number; h: number; t: number; l: number } | null
}

export const termState: TerminalState = {
    open: false,
    alive: false,
    maximized: false,
    prevBounds: null,
}

const listeners: Set<Listener> = new Set()

function notify() {
    for (const fn of listeners) fn()
}

function useSub(): void {
    const [, rerender] = useState(0)
    useEffect(() => {
        const bump = () => rerender(n => n + 1)
        listeners.add(bump)
        return () => { listeners.delete(bump) }
    }, [])
}

export function useTerminalOpen(): boolean {
    useSub()
    return termState.open
}

export function useTerminalAlive(): boolean {
    useSub()
    return termState.alive
}

export function useTerminalToggle() {
    return () => {
        console.log('TOGGLE', { alive: termState.alive, open: termState.open })
        if (!termState.alive) {
            termState.alive = true
            termState.open = true
        } else {
            termState.open = !termState.open
        }
        notify()
    }
}

export function closeTerminal() {
    termState.open = false
    notify()
}

export function killTerminal() {
    const wrapper = document.getElementById('tw')
    if (wrapper) {
        wrapper.classList.add('poof')
        setTimeout(() => {
            termState.open = false
            termState.alive = false
            termState.maximized = false
            wrapper.classList.remove('vis', 'poof')
            wrapper.style.transition = ''
            wrapper.style.transform = ''
            wrapper.style.opacity = ''
            wrapper.style.filter = ''
            wrapper.style.transformOrigin = ''
            notify()
        }, 400)
    } else {
        termState.open = false
        termState.alive = false
        termState.maximized = false
        notify()
    }
}

export function toggleMaximize(wrapper: HTMLElement | null) {
    if (!wrapper) return
    if (!termState.maximized) {
        termState.prevBounds = {
            w: wrapper.offsetWidth,
            h: wrapper.offsetHeight,
            t: wrapper.offsetTop,
            l: wrapper.offsetLeft,
        }
    }
    termState.maximized = !termState.maximized
    notify()
}
