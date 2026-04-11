import { HeroPage, Terminal, BlackHole } from '$exporter/page'
import { Cursor, Noise, SolarSystem, Equations, Particles, Dock } from '$exporter/component'
import { useMousePosition } from '$exporter/hook'

export function App() {
    useMousePosition()

    return (
        <>
            <Cursor />
            <SolarSystem />
            <Noise />
            <Equations />
            <Particles />

            <HeroPage />
            <Terminal />
            <Dock />
            <BlackHole />
        </>
    )
}
