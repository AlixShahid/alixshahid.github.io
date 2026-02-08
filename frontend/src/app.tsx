import { HeroPage, AboutPage, ExpertisePage, WorkPage, ContactPage } from '$exporter/page'
import { Cursor, GrainOverlay, ParticleCanvas, Sidebar, MobileNav, Footer } from '$exporter/component'
import { useMousePosition, useScrollSpy } from '$exporter/hook'
import { SECTIONS } from '$exporter/data'

export function App() {
    useMousePosition()
    useScrollSpy(SECTIONS)

    return (
        <>
            <GrainOverlay />
            <Cursor />
            <ParticleCanvas />
            <Sidebar />
            <MobileNav />

            <div className="main">
                <HeroPage />
                <AboutPage />
                <ExpertisePage />
                <WorkPage />
                <ContactPage />
                <Footer />
            </div>
        </>
    )
}
