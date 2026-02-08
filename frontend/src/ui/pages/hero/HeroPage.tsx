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
                    <span className="first rv d2">Ali</span>
                    <span className="last rv d3">Shahid</span>
                </h1>
                <p className="hero-title rv d4">Software Engineer</p>
                <div className="hero-actions rv d5">
                    <a href="#contact" className="btn-grad" data-h>
                        Get in touch
                    </a>
                    <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener" className="btn-ghost" data-h>
                        <GithubIcon size={16} />
                        GitHub
                    </a>
                </div>
            </div>
        </section>
    )
}
