import { useEffect, useRef } from 'preact/hooks'

interface DragState {
    dragging: boolean
    resizing: boolean
    offsetX: number
    offsetY: number
}

export function useDrag(
    wrapperRef: { current: HTMLElement | null },
    termRef: { current: HTMLElement | null },
    resizeRef: { current: HTMLElement | null },
) {
    const state = useRef<DragState>({ dragging: false, resizing: false, offsetX: 0, offsetY: 0 })

    useEffect(() => {
        const wrapper = wrapperRef.current
        const term = termRef.current
        const resizeHandle = resizeRef.current
        if (!wrapper || !term || !resizeHandle) return

        const onMouseDown = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            if (!target.closest('.tbar')) return
            if (target.closest('.tbtn') || target.tagName === 'INPUT') return
            state.current.dragging = true
            const rect = wrapper.getBoundingClientRect()
            state.current.offsetX = e.clientX - rect.left
            state.current.offsetY = e.clientY - rect.top
            term.style.cursor = 'grabbing'
            e.preventDefault()
        }

        const onResizeDown = (e: MouseEvent) => {
            state.current.resizing = true
            e.preventDefault()
            e.stopPropagation()
        }


        const onMove = (e: MouseEvent) => {
            if (state.current.dragging) {
                const x = e.clientX - state.current.offsetX
                const y = e.clientY - state.current.offsetY
                const rect = wrapper.getBoundingClientRect()
                const minY = 0  // never go above viewport
                const maxY = window.innerHeight - 40
                const minX = -(rect.width - 80)
                const maxX = window.innerWidth - 80
                wrapper.style.left = `${Math.min(maxX, Math.max(minX, x))}px`
                wrapper.style.top = `${Math.min(maxY, Math.max(minY, y))}px`
                wrapper.style.transform = 'none'
            }
            if (state.current.resizing) {
                const rect = wrapper.getBoundingClientRect()
                wrapper.style.width = `${Math.max(450, e.clientX - rect.left)}px`
                wrapper.style.height = `${Math.max(300, e.clientY - rect.top)}px`
            }
        }

        const onUp = () => {
            if (state.current.dragging) {
                state.current.dragging = false
                term.style.cursor = 'grab'
            }
            state.current.resizing = false
        }

        term.addEventListener('mousedown', onMouseDown)
        resizeHandle.addEventListener('mousedown', onResizeDown)
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)

        return () => {
            term.removeEventListener('mousedown', onMouseDown)
            resizeHandle.removeEventListener('mousedown', onResizeDown)
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
    }, [wrapperRef, termRef, resizeRef])
}
