import { GithubIcon } from '$exporter/component'
import { useScrollReveal, usePreactRef } from '$exporter/hook'
import { SOCIAL_LINKS } from '$exporter/data'

import "./hero.css"

export default function Page() {
    const ref = usePreactRef<HTMLElement>()
    useScrollReveal(ref)

    return (
        <section className="hero section" id="hero" ref={ref}>
            <div className="hero-content">
                <div className="hero-tag rv d1">
                    <span className="pulse" />
                    Open to opportunities
                </div>
                <h1 className="hero-name">
                    <span className="rv d2 first">Ali</span>
                    <span className="rv d3 last">Shahid</span>
                </h1>
                <p className="hero-title rv d4">Software Engineer</p>
                <div className="hero-scroll rv d5">
                    <a href="#about" data-h>
                        <div className="scroll-line" />
                        <span>Scroll to explore</span>
                    </a>
                </div>
            </div>
        </section>
    )
}
