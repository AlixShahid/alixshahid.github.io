import { useScrollReveal, useTilt, usePreactRef } from '$exporter/hook'
import { MailIcon, GithubIcon, LinkedInIcon } from '$exporter/component'
import { SOCIAL_LINKS } from '$exporter/data'
import type { ComponentChildren } from 'preact'

import "./contact.css"

function Row({ href, icon, label, value }: { href: string; icon: ComponentChildren; label: string; value: string }) {
    return (
        <a href={href} target={href.startsWith('mailto') ? undefined : '_blank'} rel="noopener" className="ct-row" data-h>
            <div className="ct-icon">{icon}</div>
            <div>
                <div className="ct-label">{label}</div>
                <div className="ct-val">{value}</div>
            </div>
        </a>
    )
}

export default function Page() {
    const ref = usePreactRef<HTMLElement>()
    const tiltRef = useTilt<HTMLDivElement>()
    useScrollReveal(ref)

    return (
        <section id="contact" className="section" ref={ref}>
            <div className="contact-orb" />
            <div className="ct-inner">
                <div className="sec-tag rv">Contact</div>
                <h2 className="ct-heading rv d1">
                    Let's <span className="gr">connect</span>
                </h2>
                <p className="ct-text rv d2">
                    Always up for interesting conversations, collaborations, and new opportunities. Feel free to reach out.
                </p>
                <div className="ct-card rv d3" ref={tiltRef}>
                    <div className="ct-title">Reach Me</div>
                    <Row href={`mailto:${SOCIAL_LINKS.email}`} icon={<MailIcon />} label="Email" value={SOCIAL_LINKS.email} />
                    <div className="ct-divider" />
                    <Row href={SOCIAL_LINKS.github} icon={<GithubIcon size={18} />} label="GitHub" value="AlixShahid" />
                    <div className="ct-divider" />
                    <Row href={SOCIAL_LINKS.linkedin} icon={<LinkedInIcon size={18} />} label="LinkedIn" value="AlixShahid" />
                </div>
            </div>
        </section>
    )
}
