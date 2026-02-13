import { HERO } from '$exporter/data'

import './hero.css'

export default function HeroPage() {
    const chars = HERO.name.split('').map((ch, i) => (
        <span key={i} className="ch" style={{ animationDelay: `${i * 0.06}s` }}>
            {ch === ' ' ? '\u00a0\u00a0' : ch}
        </span>
    ))

    return (
        <section className="hero-section">
            <div className="hero-content" id="heroContent">
                <div className="hero-label">{HERO.label}</div>
                <h1 className="hero-name">{chars}</h1>
                <div className="hero-role">{HERO.role}</div>
                <div className="hero-sub">
                    {HERO.sub.text} <br />
                    {HERO.sub.text2}
                </div>
            </div>
        </section>
    )
}
