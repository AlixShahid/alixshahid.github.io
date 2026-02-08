import { useScrollReveal, usePreactRef } from '$exporter/hook'
import { WORK_ITEMS, type WorkItem } from '$exporter/data'
import { LocationIcon } from '$exporter/component'

import "./work.css"

function WorkEntry({ item, delay }: { item: WorkItem; delay: number }) {
    return (
        <div className={`w-item rv d${delay}`}>
            <div className="w-date">{item.date}</div>
            <div className="w-body">
                <div className="w-role">{item.role}</div>
                <div className="w-loc">
                    <LocationIcon />
                    {item.location}
                </div>
                <p className="w-desc">{item.desc}</p>
                <div className="w-tags">
                    {item.tags.map(tag => (
                        <span key={tag}>{tag}</span>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Page() {
    const ref = usePreactRef<HTMLElement>()
    useScrollReveal(ref)

    return (
        <section id="work" className="section" ref={ref}>
            <div className="work-inner">
                <div className="sec-tag rv">Work</div>
                <h2 className="sec-heading rv d1">
                    Where I've <span className="gr">been</span>
                </h2>
                {WORK_ITEMS.map((item, i) => (
                    <WorkEntry key={item.date} item={item} delay={i + 1} />
                ))}
            </div>
        </section>
    )
}
