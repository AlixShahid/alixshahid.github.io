import readmeRaw from './files/README.md?raw'
import aboutRaw from './files/about.md?raw'
import skillsRaw from './files/skills.md?raw'
import experienceRaw from './files/experience.md?raw'
import contactRaw from './files/contact.md?raw'
import projectsRaw from './files/projects.md?raw'

export const FILE_CONTENT: Record<string, string> = {
    'README.md': readmeRaw,
    'my-info/about.md': aboutRaw,
    'my-info/skills.md': skillsRaw,
    'my-info/experience.md': experienceRaw,
    'my-info/contact.md': contactRaw,
    'my-info/projects.md': projectsRaw,
}


export const SOCIAL_LINKS = {
    github_username: 'AlixShahid',
    github_link: 'https://github.com/AlixShahid',
    linkedin_username: 'AlixShahid',
    linkedin_link: 'https://linkedin.com/in/AlixShahid',
    email: 'contact@AlixShahid.com',
} as const

export const HERO = {
    name: 'ALI SHAHID',
    label: 'software engineer',
    role: 'math  </code>  physics',
    sub: {
        text: 'it was predetermined that you would read this',
        text2: 'you were born to be here at this time',
    },
} as const

export const EQUATIONS = [
    'E=mc²',
    '∇×B=μ₀J',
    'Δx·Δp≥ℏ/2',
    'e^(iπ)+1=0',
    'F=ma',
    'PV=nRT',
    'iℏ∂ψ/∂t=Ĥψ',
] as const

export interface SkillCategory {
    name: string
    items: { label: string; pct: number }[]
}

export const SKILLS: SkillCategory[] = [
    {
        name: 'Systems',
        items: [
            { label: 'Rust', pct: 92 },
            { label: 'Python', pct: 88 },
            { label: 'Async/Tokio', pct: 85 },
            { label: 'Memory Mgmt', pct: 80 },
        ],
    },
    {
        name: 'Blockchain',
        items: [
            { label: 'Custom L1', pct: 90 },
            { label: 'Consensus', pct: 85 },
            { label: 'Smart Contracts', pct: 82 },
            { label: 'Indexing', pct: 87 },
        ],
    },
    {
        name: 'Distributed',
        items: [
            { label: 'Microservices', pct: 90 },
            { label: 'Msg Queues', pct: 85 },
            { label: 'Real-time', pct: 88 },
            { label: 'API Design', pct: 92 },
        ],
    },
    {
        name: 'Frontend',
        items: [
            { label: 'React', pct: 88 },
            { label: 'TypeScript', pct: 90 },
            { label: 'React Native', pct: 85 },
            { label: 'Next.js', pct: 82 },
        ],
    },
    {
        name: 'Research',
        items: [
            { label: 'Math', pct: 75 },
            { label: 'Physics Sim', pct: 70 },
            { label: 'AI/ML', pct: 78 },
            { label: 'Algorithms', pct: 85 },
        ],
    },
]

export interface AboutStat {
    label: string
    value: string
    pct: number
}

export const ALL_FILES = [
    'README.md',
    'my-info/about.md',
    'my-info/skills.md',
    'my-info/experience.md',
    'my-info/contact.md',
    'my-info/projects.md',
] as const

export const ABOUT_STATS: AboutStat[] = [
    { label: 'Years', value: '7+', pct: 85 },
    { label: 'Roles', value: '5', pct: 60 },
    { label: 'Countries', value: '3', pct: 36 },
    { label: 'Curiosity', value: '∞', pct: 100 },
]

export const ABOUT_LINES = [
    'Software engineer building scalable systems across the full stack.',
    'Focused on event-driven microservices, real-time pipelines,',
    'and low-latency trading infrastructure.',
    '',
    'Curious about math, physics, and first-principles thinking.',
    'Self-taught via open source and freelancing.',
]

export interface ExperienceEntry {
    year: string
    role: string
    location: string
    desc: string
    tags: string[]
}

export const EXPERIENCE: ExperienceEntry[] = [
    {
        year: '2025–2026',
        role: 'Tech Lead / Full-Stack',
        location: 'Dubai',
        desc: 'AI-powered trading signals. Event-driven microservices, real-time pipelines.',
        tags: ['Rust', 'React Native', 'Microservices', 'AI/ML'],
    },
    {
        year: '2025',
        role: 'Backend & Blockchain Dev',
        location: 'Dubai',
        desc: 'Custom L1 blockchain — runtime, consensus, indexing, smart contracts.',
        tags: ['Rust', 'Blockchain', 'Custom L1'],
    },
    {
        year: '2024–2025',
        role: 'Backend Engineer',
        location: 'Dubai',
        desc: 'Algo trading: monolith → microservices. Async processing.',
        tags: ['Rust', 'Python', 'Microservices'],
    },
    {
        year: '2022–2024',
        role: 'Full-Stack Engineer',
        location: 'Dubai',
        desc: 'End-to-end web & mobile apps.',
        tags: ['React', 'TypeScript', 'React Native'],
    },
    {
        year: '2018–2022',
        role: 'Freelance',
        location: 'Remote · Nepal',
        desc: 'Custom software, full delivery.',
        tags: ['Python', 'JavaScript', 'Full-Stack'],
    },
]

export type ProjectStatus = 'SHIPPED' | 'LIVE' | 'ONGOING'

export interface ProjectEntry {
    name: string
    desc: string
    tech: string
    status: ProjectStatus
}

export const PROJECTS: ProjectEntry[] = [
    { name: 'Custom L1 Blockchain', desc: 'Full blockchain from scratch', tech: 'Rust · Crypto · P2P', status: 'SHIPPED' },
    { name: 'AI Trading Platform', desc: 'Real-time AI trading signals', tech: 'Rust · Python · RN', status: 'LIVE' },
    { name: 'Algo Trading System', desc: 'Monolith → microservices', tech: 'Rust · Python · APIs', status: 'SHIPPED' },
    { name: 'Open Source Tools', desc: 'Dev tooling, CLI automation', tech: 'Lua · Python · Shell', status: 'ONGOING' },
]

export const FS_TREE: Record<string, string[]> = {
    '/': ['my-info/', 'README.md'],
    '/my-info': ['about.md', 'skills.md', 'experience.md', 'contact.md', 'projects.md'],
}

export const COMMANDS = [
    'help', 'about', 'skills', 'experience', 'contact', 'projects',
    'clear', 'matrix', 'ls', 'cd', 'cat', 'echo',
    'date', 'pwd', 'uname', 'whoami', 'sudo', 'exit',
] as const


export const BOOT_HTML = `
<div class="boot-card">
    <div class="boot-name">
        <span class="boot-ali">Ali</span>
        <span class="boot-shahid">Shahid</span>
    </div>
    <div class="boot-links">
        <div><span class="boot-label">Email</span> : <a href="mailto:${SOCIAL_LINKS.email}" class="boot-link" data-h>${SOCIAL_LINKS.email}</a></div>
        <div><span class="boot-label">Github</span> : <a href="${SOCIAL_LINKS.github_link}" target="_blank" rel="noopener" class="boot-link" data-h>github.com/<span class="boot-user">${SOCIAL_LINKS.github_username}</span></a></div>
        <div><span class="boot-label">Linkedin</span> : <a href="${SOCIAL_LINKS.linkedin_link}" target="_blank" rel="noopener" class="boot-link" data-h>linkedin.com/in/<span class="boot-user">${SOCIAL_LINKS.linkedin_username}</span></a></div>
    </div>
</div>
`
