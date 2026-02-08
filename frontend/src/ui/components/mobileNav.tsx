import { useState } from 'preact/hooks'
import { SECTIONS, NAV_LABELS } from '$exporter/data'

import "./mobile-nav.css"

export default function MobileNav() {
    const [open, setOpen] = useState(false)

    const close = () => setOpen(false)

    return (
        <>
            <div className="topnav">
                <a href="#" className="tn-logo">Ali Shahid</a>
                <button className="burger" onClick={() => setOpen(!open)} aria-label="Menu" data-h>
                    <span />
                    <span />
                    <span />
                </button>
            </div>
            <div className={`mob ${open ? 'open' : ''}`}>
                {SECTIONS.map(id => (
                    <a key={id} href={`#${id}`} onClick={close}>
                        {NAV_LABELS[id].charAt(0).toUpperCase() + NAV_LABELS[id].slice(1)}
                    </a>
                ))}
            </div>
        </>
    )
}
