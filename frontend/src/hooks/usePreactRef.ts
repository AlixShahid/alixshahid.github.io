import { useRef } from 'preact/hooks'
import type { Ref } from 'preact'

export type ElementRef<T> = Ref<T> & { current: T | null }

export function usePreactRef<T extends HTMLElement>(): ElementRef<T> {
    return useRef<T>(null) as unknown as ElementRef<T>
}
