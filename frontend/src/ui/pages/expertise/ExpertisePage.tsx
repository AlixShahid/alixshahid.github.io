import { ExpertiseIcon } from '$exporter/component'
import { useScrollReveal, useTilt, usePreactRef } from '$exporter/hook'
import { EXPERTISE_ITEMS, type ExpertiseItem } from '$exporter/data'

import "./expertise.css"

function Card({ item, delay }: { item: ExpertiseItem; delay: number }) {
    const tiltRef = useTilt<HTMLDivElement>()

    return (
        <div className={`int-card rv d${delay}`} ref={tiltRef}>
            <div className="int-icon">
                <ExpertiseIcon id={item.icon} />
            </div>
            <div className="int-label">{item.label}</div>
            <div className="int-desc">{item.desc}</div>
        </div>
    )
}

export default function Page() {
    const ref = usePreactRef<HTMLElement>()
    useScrollReveal(ref)

    return (
        <section id="interests" className="section" ref={ref}>
            <div className="int-inner">
                <div className="sec-tag rv">Expertise</div>
                <h2 className="sec-heading rv d1">
                    What I <span className="gr">work on</span>
                </h2>
                <div className="int-grid">
                    {EXPERTISE_ITEMS.map((item, i) => (
                        <Card key={item.icon} item={item} delay={i + 1} />
                    ))}
                </div>
            </div>
        </section>
    )
}
