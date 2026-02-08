import { useScrollReveal, useTilt, usePreactRef } from '$exporter/hook'
import { ABOUT_TEXT } from '$exporter/data'

import "./about.css"

export default function Page() {
    const ref = usePreactRef<HTMLElement>()
    const tiltRef = useTilt<HTMLDivElement>()
    useScrollReveal(ref)

    return (
        <section id="about" className="section" ref={ref}>
            <div className="about-inner">
                <div className="sec-tag rv">About</div>
                <div className="about-card rv d1" ref={tiltRef}>
                    <p className="about-text">{ABOUT_TEXT}</p>
                </div>
            </div>
        </section>
    )
}
